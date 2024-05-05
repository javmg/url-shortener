import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { UrlModule } from '../../src/module/url.module';
import { IUrlRepository } from '../../src/repository/url.repository';

describe('UrlController tests', () => {
  let app: INestApplication;
  let urlRepository: IUrlRepository;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UrlModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    urlRepository = app.get(IUrlRepository);

    await app.init();
  });

  describe('given POST request to /url', () => {
    test('when wrong parameters passed then error returned', async () => {
      const res = await request(app.getHttpServer()).post('/url').send({
        url: 'abc',
        callbackUrl: 'def',
      });

      expect(res.status).toBe(400);
    });

    test('when valid parameters passed then URL created', async () => {
      const res = await request(app.getHttpServer()).post('/url').send({
        url: 'https://google.com',
        callbackUrl: 'https://httpbin.org/status/200',
      });

      expect(res.status).toBe(201);

      const urlEntities = await app.get(IUrlRepository).findAll();

      expect(urlEntities.length).toBe(1);

      expect(urlEntities[0].createdAt).toBeTruthy();
      expect(urlEntities[0].url).toBe('https://google.com');
      expect(urlEntities[0].callbackUrl).toBe('https://httpbin.org/status/200');
      expect(urlEntities[0].path.length).toBe(10);
      expect(urlEntities[0].numCallbackAttempts).toBe(0);
      expect(urlEntities[0].acknowledged).toBe(false);
    });
  });

  describe('given GET request to /:path', () => {
    test('when URL not found under path then error returned', async () => {
      const res = await request(app.getHttpServer()).get('/unknown');

      expect(res.status).toBe(404);

      expect(res.body.message).toBe(
        "URL with path 'unknown' not found or not acknowledged",
      );
    });

    test('when URL found under path but unacknowledged then error returned', async () => {
      await urlRepository.save({
        createdAt: new Date(),
        url: 'https://google.com',
        callbackUrl: '',
        path: 'myPath',
        numCallbackAttempts: 0,
        acknowledged: false,
      });

      const res = await request(app.getHttpServer()).get('/myPath');

      expect(res.status).toBe(404);

      expect(res.body.message).toBe(
        "URL with path 'myPath' not found or not acknowledged",
      );
    });

    test('when URL found under path and acknowledged then URL returned', async () => {
      await urlRepository.save({
        createdAt: new Date(),
        url: 'https://google.com',
        callbackUrl: '',
        path: 'acknowledged',
        numCallbackAttempts: 0,
        acknowledged: true,
      });

      const res = await request(app.getHttpServer()).get('/acknowledged');

      expect(res.status).toBe(200);

      expect(res.body.url).toBe('https://google.com');
    });
  });

  describe('given PATCH request to /:path/acknowledged', () => {
    test('when URL not found under path then error returned', async () => {
      const res = await request(app.getHttpServer()).patch(
        '/unknown/acknowledged',
      );

      expect(res.status).toBe(404);

      expect(res.body.message).toBe("URL with path 'unknown' not found");
    });

    test('when URL found under path then URL acknowledged', async () => {
      await urlRepository.save({
        createdAt: new Date(),
        url: 'https://google.com',
        callbackUrl: '',
        path: 'myPath',
        numCallbackAttempts: 0,
        acknowledged: false,
      });

      const res = await request(app.getHttpServer()).patch(
        '/myPath/acknowledged',
      );

      expect(res.status).toBe(200);

      expect(res.body.url).toBe('https://google.com');

      const urlEntity = await urlRepository.findOneByPath('myPath');

      expect(urlEntity.acknowledged).toBe(true);
    });
  });
});
