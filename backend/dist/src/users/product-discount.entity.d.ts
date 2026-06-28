import { User } from './user.entity';
import { Product } from '../products/product.entity';
export declare class ProductDiscount {
    id: string;
    user_id: string;
    product_id: number;
    discount_percentage: number;
    special_price: number;
    user: User;
    product: Product;
}
