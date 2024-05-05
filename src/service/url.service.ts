import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { GetUrlRequest, CreatedUrlRequest } from '../dto/url.request.dto';
import { UrlView } from '../dto/url.response.dto';
import { IUrlRepository } from '../repository/url.repository';
import { UrlEntity } from '../entity/url.entity';
import urlUtil from '../util/url.util';

export interface IUrlService {
  create(criteria: CreatedUrlRequest): Promise<void>;

  get(criteria: GetUrlRequest): Promise<UrlView>;

  acknowledge(criteria: GetUrlRequest): Promise<UrlView>;
}

@Injectable()
export class UrlService implements IUrlService {
  private readonly logger = new Logger(UrlService.name);

  constructor(
    @Inject(IUrlRepository) private readonly urlRepository: IUrlRepository,
  ) {}

  create = async (criteria: CreatedUrlRequest): Promise<void> => {
    const path = urlUtil.generateUrlPath();

    const existingUrlEntity = await this.urlRepository.findOneByPath(path);

    if (existingUrlEntity) {
      throw new ConflictException(`URL with path '${path}' existed already`);
    }

    const urlEntity: UrlEntity = {
      createdAt: new Date(),
      url: criteria.url,
      callbackUrl: criteria.callbackUrl,
      path,
      numCallbackAttempts: 0,
      acknowledged: false,
    };

    await this.urlRepository.save(urlEntity);

    this.logger.log(`Created URL with path '${path}' for '${criteria.url}'`);
  };

  acknowledge = async (criteria: GetUrlRequest) => {
    const { path } = criteria;

    const urlEntity = await this.urlRepository.findOneByPath(path);

    if (!urlEntity) {
      throw new NotFoundException(`URL with path '${path}' not found`);
    }

    const savedUrlEntity = await this.urlRepository.save({
      ...urlEntity,
      acknowledged: true,
      callbackNextAttemptAt: null,
    });

    return {
      url: savedUrlEntity.url,
    };
  };

  get = async (criteria: GetUrlRequest): Promise<UrlView> => {
    const { path } = criteria;

    const urlEntity = await this.urlRepository.findOneByPath(path);

    if (!urlEntity || !urlEntity.acknowledged) {
      throw new NotFoundException(
        `URL with path '${path}' not found or not acknowledged`,
      );
    }

    return {
      url: urlEntity.url,
    };
  };
}

export const IUrlService = Symbol('IUrlService');
