import { Repository } from 'typeorm';
import { Order } from '../orders/order.entity';
import { SystemConfig } from '../system-configs/system-config.entity';
export declare class XeroService {
    private orderRepository;
    private configRepository;
    private readonly logger;
    constructor(orderRepository: Repository<Order>, configRepository: Repository<SystemConfig>);
    private getConfig;
    private setConfig;
    getXeroAuthUrl(): Promise<string>;
    handleCallback(code: string): Promise<any>;
    getAccessToken(): Promise<string | null>;
    syncOrderToXero(orderId: string): Promise<{
        success: boolean;
        invoiceId?: string;
    }>;
    syncPendingPaidOrders(): Promise<{
        processed: number;
        successCount: number;
    }>;
}
