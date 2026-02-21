import { Module } from '@nestjs/common';
import { DevtoolsService } from './devtools.service';
import { DevtoolsController } from './devtools.controller';

@Module({
  providers: [DevtoolsService],
  controllers: [DevtoolsController]
})
export class DevtoolsModule {}
