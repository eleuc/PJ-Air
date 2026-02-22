import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
  ) {}

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({ relations: ['items', 'items.product'] });
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.orderRepository.find({ 
      where: { user_id: userId },
      relations: ['items', 'items.product', 'address'],
      order: { created_at: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ 
      where: { id },
      relations: ['items', 'items.product']
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async create(userId: string, orderData: any): Promise<Order> {
    const { items, ...rest } = orderData;
    
    const { deliveryDate, paymentDueDate, addressId, ...otherData } = rest;
    
    const orderToCreate = this.orderRepository.create({
      ...otherData,
      delivery_date: deliveryDate,
      payment_due_date: paymentDueDate,
      address_id: addressId,
      user_id: userId,
    });
    
    const savedResult = await this.orderRepository.save(orderToCreate);
    const savedOrder = Array.isArray(savedResult) ? savedResult[0] : savedResult;

    if (items && items.length > 0) {
      const orderItems = items.map((item: any) => 
        this.orderItemRepository.create({
          product_id: item.productId,
          price_at_time: item.price,
          quantity: item.quantity,
          order_id: savedOrder.id,
        })
      );
      await this.orderItemRepository.save(orderItems);
    }

    return this.findOne(savedOrder.id);
  }

  async updateStatus(id: string, status: string): Promise<Order> {
    const order = await this.findOne(id);
    order.status = status;
    const result = await this.orderRepository.save(order);
    return Array.isArray(result) ? result[0] : result;
  }
}
