import { Order } from './order.entity';
import { Product } from '../products/product.entity';
export declare class OrderItem {
    id: string;
    order_id: string;
    product_id: number;
    quantity: number;
    price_at_time: number;
    order: Order;
    product: Product;
}
