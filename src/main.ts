import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './module/app.module';
import { version } from '../package.json';

const appName = 'url-shortener';
const appVersion = version;
const appDesc =
  'This is a simple application that allows linking a URL with a shortened version on this server';

async function bootstrap() {
  const webApp = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  webApp.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
    .setTitle(appName)
    .setDescription(appDesc)
    .setVersion(appVersion)
    .build();

  const document = SwaggerModule.createDocument(webApp, config);
  SwaggerModule.setup('api', webApp, document);

  await webApp.listen(process.env.SERVER_PORT || 80);
}

bootstrap();
