import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
export declare class OrdersService {
    private orderRepository;
    private orderItemRepository;
    constructor(orderRepository: Repository<Order>, orderItemRepository: Repository<OrderItem>);
    findInRange(startDate: string, endDate: string, userId?: string): Promise<Order[]>;
    findAll(): Promise<Order[]>;
    findByUser(userId: string): Promise<Order[]>;
    findOne(id: string): Promise<Order>;
    create(userId: string, orderData: any): Promise<Order>;
    updateStatus(id: string, status: string): Promise<Order>;
    assignDelivery(id: string, deliveryUserId: string): Promise<Order>;
    update(id: string, updateData: any): Promise<Order>;
}
