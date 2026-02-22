import { Controller, Post } from '@nestjs/common';
import { DevtoolsService } from './devtools.service';

@Controller('devtools')
export class DevtoolsController {
  constructor(private devtoolsService: DevtoolsService) {}

  @Post('seed')
  async seed() {
    return this.devtoolsService.seedProducts();
  }
}
