import { Test, TestingModule } from '@nestjs/testing';
import { DevtoolsService } from './devtools.service';

describe('DevtoolsService', () => {
  let service: DevtoolsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DevtoolsService],
    }).compile();

    service = module.get<DevtoolsService>(DevtoolsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
