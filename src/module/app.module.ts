import { Module } from '@nestjs/common';
import { UrlModule } from './url.module';
import { ApiModule } from './api.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ApiModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UrlModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
