import { Test, TestingModule } from '@nestjs/testing';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';

describe('AddressesController', () => {
  let controller: AddressesController;
  let service: AddressesService;

  const mockAddressesService = {
    create: jest.fn(),
    findByUser: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddressesController],
      providers: [
        {
          provide: AddressesService,
          useValue: mockAddressesService,
        },
      ],
    }).compile();

    controller = module.get<AddressesController>(AddressesController);
    service = module.get<AddressesService>(AddressesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('routing for addresses', () => {
    it('should create an address', async () => {
      const addressData = { street: 'Main St' };
      const body = { userId: '1', ...addressData };
      mockAddressesService.create.mockResolvedValue({ id: '10', ...body });

      const result = await controller.create(body);
      expect(service.create).toHaveBeenCalledWith('1', addressData);
      expect(result).toEqual({ id: '10', userId: '1', street: 'Main St' });
    });

    it('should fetch addresses by user', async () => {
      mockAddressesService.findByUser.mockResolvedValue([{ id: '10' }]);
      const result = await controller.findByUser('1');
      expect(service.findByUser).toHaveBeenCalledWith('1');
      expect(result).toEqual([{ id: '10' }]);
    });

    it('should edit an address', async () => {
      const body = { street: 'Second St' };
      mockAddressesService.update.mockResolvedValue({ id: '10', ...body });
      const result = await controller.update('10', body);
      expect(service.update).toHaveBeenCalledWith('10', body);
      expect(result).toEqual({ id: '10', street: 'Second St' });
    });

    it('should delete an address', async () => {
      mockAddressesService.delete.mockResolvedValue({ id: '10' });
      const result = await controller.delete('10');
      expect(service.delete).toHaveBeenCalledWith('10');
      expect(result).toEqual({ id: '10' });
    });
  });
});
