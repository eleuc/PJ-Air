import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  const mockOrdersService = {
    create: jest.fn(),
    updateStatus: jest.fn(),
    findAll: jest.fn(),
    findByUser: jest.fn(),
    findInRange: jest.fn(),
    findOne: jest.fn(),
    assignDelivery: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should extract userId and orderData and call service.create', async () => {
      const mockUser = { id: 'user-123', role: 'client' };
      const body = {
        userId: 'user-123',
        total: 100,
        items: [{ productId: 1, quantity: 2, price: 50 }],
      };

      const expectedOrderData = {
        total: 100,
        items: [{ productId: 1, quantity: 2, price: 50 }],
      };

      mockOrdersService.create.mockResolvedValue('mock-order');

      const result = await controller.create(mockUser, body);

      expect(service.create).toHaveBeenCalledWith('user-123', expectedOrderData);
      expect(result).toBe('mock-order');
    });
  });

  describe('updateStatus', () => {
    it('should extract id and status and call service.updateStatus', async () => {
      mockOrdersService.updateStatus.mockResolvedValue('mock-updated-order');

      const result = await controller.updateStatus('order-123', 'shipped');

      expect(service.updateStatus).toHaveBeenCalledWith('order-123', 'shipped');
      expect(result).toBe('mock-updated-order');
    });
  });
});
