import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';
export declare class OrdersService {
    private orderRepository;
    private orderItemRepository;
    private userRepository;
    private productRepository;
    constructor(orderRepository: Repository<Order>, orderItemRepository: Repository<OrderItem>, userRepository: Repository<User>, productRepository: Repository<Product>);
    private validateStatusTransition;
    private calculateOrderPricesAndTotal;
    findInRange(startDate: string, endDate: string, userId?: string, filterBy?: 'created_at' | 'delivery_date'): Promise<Order[]>;
    findAll(): Promise<Order[]>;
    findByUser(userId: string): Promise<Order[]>;
    findOne(id: string): Promise<Order>;
    create(userId: string, orderData: any): Promise<Order>;
    updateStatus(id: string, status: string, userRole?: string): Promise<Order>;
    assignDelivery(id: string, deliveryUserId: string): Promise<Order>;
    updatePaymentInfo(orderId: string, data: {
        payment_status?: string;
        payment_gateway?: string;
        payment_transaction_id?: string;
    }): Promise<Order>;
    update(id: string, updateData: any, userRole?: string): Promise<Order>;
}
