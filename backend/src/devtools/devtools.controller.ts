import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { DevtoolsService } from './devtools.service';

@Controller('devtools')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class DevtoolsController {
  constructor(private devtoolsService: DevtoolsService) {}

  @Post('seed')
  async seed() {
    return this.devtoolsService.seedProducts();
  }

  @Post('seed-admin')
  async seedAdmin() {
    return this.devtoolsService.seedAdmin();
  }

  @Post('seed-reports')
  async seedReports() {
    return this.devtoolsService.seedReports();
  }
}
