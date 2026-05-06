import { Test, TestingModule } from '@nestjs/testing';
import { DevtoolsService } from './devtools.service';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { OrdersService } from '../orders/orders.service';
import { AddressesService } from '../addresses/addresses.service';

describe('DevtoolsService', () => {
  let service: DevtoolsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevtoolsService,
        { provide: ProductsService, useValue: {} },
        { provide: UsersService, useValue: {} },
        { provide: OrdersService, useValue: {} },
        { provide: AddressesService, useValue: {} },
      ],
    }).compile();

    service = module.get<DevtoolsService>(DevtoolsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
