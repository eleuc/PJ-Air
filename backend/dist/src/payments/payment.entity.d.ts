import { Order } from '../orders/order.entity';
export declare class Payment {
    id: string;
    order_id: string;
    amount: number;
    status: string;
    gateway: string;
    transaction_id: string;
    created_at: Date;
    order: Order;
}
