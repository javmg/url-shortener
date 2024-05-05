import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UrlView {
  @ApiProperty()
  @IsNotEmpty()
  url: string;
}
