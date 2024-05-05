import { Module } from '@nestjs/common';
import { ApiController } from '../controller/api.controller';

@Module({
  controllers: [ApiController],
})
export class ApiModule {}
