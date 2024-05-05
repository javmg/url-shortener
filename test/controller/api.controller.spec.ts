import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ApiModule } from '../../src/module/api.module';

describe('ApiController tests', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();
  });

  describe('given GET request to /', () => {
    test('then redirection to /api happens', async () => {
      const res = await request(app.getHttpServer()).get('/');

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/api');
    });
  });
});
