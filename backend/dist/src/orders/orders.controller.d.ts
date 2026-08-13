import { OrdersService } from './orders.service';
import { ExcelService } from './excel.service';
export declare class OrdersController {
    private readonly ordersService;
    private readonly excelService;
    constructor(ordersService: OrdersService, excelService: ExcelService);
    create(body: any): Promise<import("./order.entity").Order>;
    findAll(): Promise<import("./order.entity").Order[]>;
    findByUser(userId: string): Promise<import("./order.entity").Order[]>;
    exportIndividual(startDate: string, endDate: string, res: any): Promise<void>;
    exportConsolidated(startDate: string, endDate: string, res: any): Promise<void>;
    findInRange(startDate: string, endDate: string, userId?: string, filterBy?: 'created_at' | 'delivery_date'): Promise<import("./order.entity").Order[]>;
    findOne(id: string): Promise<import("./order.entity").Order>;
    updateStatus(id: string, status: string, req: any): Promise<import("./order.entity").Order>;
    assignDelivery(id: string, deliveryUserId: string): Promise<import("./order.entity").Order>;
    updatePaymentInfo(id: string, body: {
        payment_status?: string;
        payment_gateway?: string;
        payment_transaction_id?: string;
    }): Promise<import("./order.entity").Order>;
    update(id: string, body: any, req: any): Promise<import("./order.entity").Order>;
}
