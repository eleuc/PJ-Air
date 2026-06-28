import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';
import { BadRequestException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepository: any;
  let orderItemRepository: any;
  let userRepository: any;
  let productRepository: any;

  beforeEach(async () => {
    orderRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    orderItemRepository = {
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    userRepository = {
      findOne: jest.fn(),
    };

    productRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: orderRepository },
        { provide: getRepositoryToken(OrderItem), useValue: orderItemRepository },
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(Product), useValue: productRepository },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate accurate order totals including all items and applied discounts', async () => {
    const orderData = {
      items: [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 },
      ],
    };

    // Mock user with general discount and product specific special price
    userRepository.findOne.mockResolvedValue({
      id: 'user-123',
      general_discount: 10, // 10%
      productDiscounts: [
        { product_id: 1, special_price: 45 },
      ],
    });

    // Mock products
    productRepository.findOne.mockImplementation(async (opts) => {
      const id = opts.where.id;
      if (id === 1) return { id: 1, price: 50 }; // Special price 45 -> 45 * 2 = 90
      if (id === 2) return { id: 2, price: 100 }; // General discount 10% -> 90 * 1 = 90
      return null;
    });

    const expectedTotal = 180; // 90 + 90
    const createdOrder = { id: 'order-123', total: expectedTotal };
    
    orderRepository.create.mockImplementation((data) => ({ ...createdOrder, ...data }));
    orderRepository.save.mockResolvedValue(createdOrder);
    service.findOne = jest.fn().mockResolvedValue(createdOrder);
    orderItemRepository.create.mockImplementation((item) => item);
    orderItemRepository.save.mockResolvedValue([]);

    const result = await service.create('user-123', orderData);
    expect(result.total).toBe(expectedTotal);
    expect(orderRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      total: expectedTotal,
    }));
  });

  it('should throw a validation error if an order item quantity is less than 1', async () => {
    const orderData = {
      items: [{ productId: 1, quantity: 0 }],
    };

    userRepository.findOne.mockResolvedValue({ id: 'user-123', productDiscounts: [] });
    productRepository.findOne.mockResolvedValue({ id: 1, price: 50 });

    await expect(service.create('user-123', orderData)).rejects.toThrow(BadRequestException);
  });

  it('should prevent invalid order status transitions (e.g., Delivered -> Pending)', async () => {
    const existingOrder = { id: 'order-123', status: 'delivered' };
    service.findOne = jest.fn().mockResolvedValue(existingOrder);
    
    await expect(service.updateStatus('order-123', 'pending')).rejects.toThrow(BadRequestException);
  });
});

