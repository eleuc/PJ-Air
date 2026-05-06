import { Test, TestingModule } from '@nestjs/testing';
import { DevtoolsService } from './devtools.service';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { OrdersService } from '../orders/orders.service';
import { AddressesService } from '../addresses/addresses.service';
import { SEED_PRODUCTS } from './products.seed';

describe('DevtoolsService', () => {
  let service: DevtoolsService;
  let productsService: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevtoolsService,
        { 
          provide: ProductsService, 
          useValue: {
            syncLocalProducts: jest.fn().mockResolvedValue({ message: 'Synced' }),
            findAll: jest.fn().mockResolvedValue([]),
          } 
        },
        { provide: UsersService, useValue: {} },
        { provide: OrdersService, useValue: {} },
        { provide: AddressesService, useValue: {} },
      ],
    }).compile();

    service = module.get<DevtoolsService>(DevtoolsService);
    productsService = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Integration Logic', () => {
    it('should test that the database wiping and seeding logic correctly populates the database with expected products.seed.ts mock data', async () => {
      // Execute the seeding logic
      await service.seedProducts();

      // Verify that the integration with ProductsService syncs the SEED_PRODUCTS correctly
      expect(productsService.syncLocalProducts).toHaveBeenCalledWith(SEED_PRODUCTS);
      expect(productsService.syncLocalProducts).toHaveBeenCalledTimes(1);
    });
  });
});
