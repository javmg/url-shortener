import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { GetUrlRequest, CreatedUrlRequest } from '../dto/url.request.dto';
import { UrlView } from '../dto/url.response.dto';
import { IUrlService } from '../service/url.service';

@ApiTags('Url')
@Controller()
export class UrlController {
  constructor(@Inject(IUrlService) private readonly urlService: IUrlService) {}

  @Post('/url')
  @ApiOperation({
    summary: 'Create a new URL.',
    description:
      'Create a new URL.<br/><br/>' +
      'The passed callback url will be invoked with the resulting shortened URL',
  })
  @ApiCreatedResponse({
    description: 'URL was created.',
  })
  async create(@Body() criteria: CreatedUrlRequest): Promise<void> {
    await this.urlService.create(criteria);
  }

  @Get('/:path')
  @ApiOperation({
    summary: 'Get a URL by its path.',
    description: 'Get a URL by its path.',
  })
  @ApiOkResponse({
    description: 'URL was retrieved.',
    type: UrlView,
  })
  @ApiNotFoundResponse({
    description: 'URL not found or not acknowledged.',
  })
  async get(@Param() criteria: GetUrlRequest): Promise<UrlView> {
    return this.urlService.get(criteria);
  }

  @Patch('/:path/acknowledged')
  @ApiOperation({
    summary: 'Acknowledge a URL identified by its path.',
    description: 'Acknowledge a URL identified by its path..',
  })
  @ApiOkResponse({
    description: 'URL was acknowledged.',
    type: UrlView,
  })
  @ApiNotFoundResponse({
    description: 'URL not found.',
  })
  async update(@Param() criteria: GetUrlRequest): Promise<UrlView> {
    return this.urlService.acknowledge(criteria);
  }
}
