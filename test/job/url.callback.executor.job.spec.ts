import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { UrlModule } from '../../src/module/url.module';
import { IUrlRepository } from '../../src/repository/url.repository';
import { UrlCallbackExecutorJob } from '../../src/job/url.callback.executor.job';
import { HttpService } from '@nestjs/axios';

describe('UrlCallbackExecutorJob tests', () => {
  let app: INestApplication;
  let job: UrlCallbackExecutorJob;
  let urlRepository: IUrlRepository;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UrlModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    job = app.get(UrlCallbackExecutorJob);
    urlRepository = app.get(IUrlRepository);

    await app.init();
  });

  describe('given job execution', () => {
    test('when URL is ready for callback and callback succeeds then URL acknowledged', async () => {
      await urlRepository.save({
        createdAt: new Date(),
        url: 'https://google.com',
        callbackUrl: 'myCallbackUrl',
        path: 'myPath',
        numCallbackAttempts: 0,
        acknowledged: false,
      });

      const mocKHttpService = app.get(HttpService);

      mocKHttpService.axiosRef.post = jest
        .fn()
        .mockImplementation((url, data) => {
          if (
            url !== 'myCallbackUrl' ||
            data.shortenedUrl !== 'http://localhost:3000/myPath'
          ) {
            throw new Error('Wrong parameters');
          }

          return {
            data: {},
            status: 200,
          };
        });

      await job.execute();

      const urlEntity = await urlRepository.findOneByPath('myPath');

      expect(urlEntity.numCallbackAttempts).toBe(1);
      expect(urlEntity.callbackLastAttemptedAt).toBeTruthy();
      expect(urlEntity.callbackNextAttemptAt).toBeFalsy();
      expect(urlEntity.acknowledged).toBe(true);
    });

    test('when URL is ready for callback and callback fails then URL not acknowledged', async () => {
      await urlRepository.save({
        createdAt: new Date(),
        url: 'https://google.com',
        callbackUrl: 'myCallbackUrl',
        path: 'myPath',
        numCallbackAttempts: 0,
        acknowledged: false,
      });

      const mocKHttpService = app.get(HttpService);

      mocKHttpService.axiosRef.post = jest.fn().mockImplementation(() => {
        throw new Error('Testing error');
      });

      await job.execute();

      const urlEntity = await urlRepository.findOneByPath('myPath');

      expect(urlEntity.numCallbackAttempts).toBe(1);
      expect(urlEntity.callbackLastAttemptedAt).toBeTruthy();
      expect(urlEntity.callbackNextAttemptAt).toBeTruthy();
      expect(urlEntity.acknowledged).toBe(false);
    });
  });
});
