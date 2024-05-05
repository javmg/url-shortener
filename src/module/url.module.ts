import { Module } from '@nestjs/common';
import { UrlController } from '../controller/url.controller';
import { IUrlService, UrlService } from '../service/url.service';
import { IUrlRepository, UrlRepository } from '../repository/url.repository';
import { UrlCallbackExecutorJob } from '../job/url.callback.executor.job';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
    }),
    HttpModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [UrlController],
  providers: [
    {
      provide: IUrlRepository,
      useClass: UrlRepository,
    },
    {
      provide: IUrlService,
      useClass: UrlService,
    },
    UrlCallbackExecutorJob,
  ],
})
export class UrlModule {}
