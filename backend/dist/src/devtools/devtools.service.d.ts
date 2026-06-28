import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { OrdersService } from '../orders/orders.service';
import { AddressesService } from '../addresses/addresses.service';
export declare class DevtoolsService {
    private productsService;
    private usersService;
    private ordersService;
    private addressesService;
    constructor(productsService: ProductsService, usersService: UsersService, ordersService: OrdersService, addressesService: AddressesService);
    seedProducts(): Promise<import("../products/product.entity").Product[]>;
    seedAdmin(): Promise<{
        message: string;
        email: string;
    }>;
    seedReports(): Promise<{
        message: string;
        clients: number;
    }>;
}
