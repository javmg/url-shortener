import { IsNotEmpty, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatedUrlRequest {
  @ApiProperty({
    description: 'The URL to shorten',
    example: 'https://www.google.com',
  })
  @IsUrl()
  url: string;

  @ApiProperty({
    description:
      'The callback where the shortened URL will be sent to via POST request',
    example: 'https://httpbin.org/status/200',
  })
  @IsUrl()
  callbackUrl: string;
}

export class GetUrlRequest {
  @ApiProperty({ description: 'The path linked to the URL' })
  @IsNotEmpty()
  path: string;
}
