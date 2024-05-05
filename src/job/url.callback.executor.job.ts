import { SchedulerRegistry } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { CronJob } from 'cron';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { IUrlRepository } from '../repository/url.repository';
import { HttpService } from '@nestjs/axios';
import { UrlEntity } from '../entity/url.entity';
import * as pLimit from 'p-limit';

@Injectable()
export class UrlCallbackExecutorJob {
  private executing: boolean;

  private readonly logger = new Logger(UrlCallbackExecutorJob.name);

  private readonly processConcurrency: pLimit.Limit;

  private readonly serverUrl: string;

  private readonly autoAcknowledge: boolean;

  private readonly maxNumAttempts: number;

  private readonly baseDelayInMs: number;

  private readonly exponentialUntilAttemptNumber: number;

  public constructor(
    configService: ConfigService,
    schedulerRegistry: SchedulerRegistry,
    @Inject(IUrlRepository) private readonly urlRepository: IUrlRepository,
    private readonly httpService: HttpService,
  ) {
    const cronExpression = configService.getOrThrow(
      'URL_CALLBACK_EXECUTOR_CRON',
    );

    this.processConcurrency = pLimit(
      Number(configService.get('URL_CALLBACK_CONCURRENT_LIMIT') || '5'),
    );

    this.serverUrl = configService.getOrThrow('SERVER_URL');

    this.autoAcknowledge =
      configService.getOrThrow(
        'URL_AUTO_ACKNOWLEDGE_ON_SUCCESSFUL_CALLBACK',
      ) === 'true';

    this.maxNumAttempts = Number(
      configService.getOrThrow('URL_CALLBACK_MAX_ATTEMPTS'),
    );
    this.baseDelayInMs = Number(
      configService.getOrThrow('URL_CALLBACK_BASE_DELAY_IN_MS'),
    );
    this.exponentialUntilAttemptNumber = Number(
      configService.getOrThrow('URL_CALLBACK_EXPONENTIAL_DELAY_UNTIL_ATTEMPT'),
    );

    const job = new CronJob(cronExpression, async () => {
      await this.execute();
    });

    schedulerRegistry.addCronJob(UrlCallbackExecutorJob.name, job);

    job.start();
  }

  public readonly execute = async (): Promise<void> => {
    if (this.executing) {
      this.logger.log('Job skipped (ongoing execution)');
      return;
    }

    try {
      const now = new Date();

      const urlEntities = await this.urlRepository.findReadyForCallback(
        this.maxNumAttempts,
        now,
      );

      this.logger.debug(`Callbacks to be attempted: ${urlEntities.length}`);

      const executions = urlEntities.map((urlEntity) => {
        this.processConcurrency(async () => this.processUrl(now, urlEntity));
      });

      await Promise.all(executions);
    } catch (err) {
      this.logger.error(err, 'Uncaught error');
    } finally {
      this.executing = false;
    }
  };

  private processUrl = async (now: Date, urlEntity: UrlEntity) => {
    const success = await this.executeCallback(urlEntity);

    const acknowledged =
      success && this.autoAcknowledge ? true : urlEntity.acknowledged;

    const callbackNextAttemptAt = acknowledged
      ? null
      : new Date(
          now.getTime() +
            this.calculateNextAttemptDelta(urlEntity.numCallbackAttempts),
        );

    if (callbackNextAttemptAt) {
      this.logger.debug(
        `Callback for URL with path '${urlEntity.path}' will be reattempted after ${callbackNextAttemptAt.toJSON()}`,
      );
    }

    const updatedUrlEntity = {
      ...urlEntity,
      numCallbackAttempts: urlEntity.numCallbackAttempts + 1,
      callbackLastAttemptedAt: now,
      callbackNextAttemptAt,
      acknowledged,
    };

    try {
      await this.urlRepository.save(updatedUrlEntity);
    } catch (e) {
      this.logger.error(
        `Error when updating URL with path '${urlEntity.path}`,
        e.stack,
      );
    }
  };

  private executeCallback = async (urlEntity: UrlEntity): Promise<boolean> => {
    try {
      await this.httpService.axiosRef.post(urlEntity.callbackUrl, {
        url: urlEntity.url,
        shortenedUrl: `${this.serverUrl}/${urlEntity.path}`,
        ...(!this.autoAcknowledge && {
          acknowledgementUrl: `${this.serverUrl}/${urlEntity.path}/acknowledged`,
          method: 'PATCH',
        }),
      });

      this.logger.log(
        `Callback for URL with path '${urlEntity.path}' under '${urlEntity.callbackUrl}' succeeded`,
      );

      return true;
    } catch (e) {
      this.logger.error(
        `Callback for URL with path '${urlEntity.path}' under '${urlEntity.callbackUrl}' failed (attempts: ${urlEntity.numCallbackAttempts + 1} ).`,
      );

      return false;
    }
  };

  private calculateNextAttemptDelta = (currentAttempt: number): number => {
    const attempt = Math.min(
      currentAttempt,
      this.exponentialUntilAttemptNumber,
    );

    return this.baseDelayInMs * 2 ** attempt;
  };
}
