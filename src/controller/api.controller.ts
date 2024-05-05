import { Controller, Get, Logger, Redirect } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller()
export class ApiController {
  private readonly logger = new Logger(ApiController.name);

  @Get()
  @Redirect('/api')
  @ApiExcludeEndpoint()
  openApiRedirect(): void {
    this.logger.verbose('redirecting to /api');
  }
}
