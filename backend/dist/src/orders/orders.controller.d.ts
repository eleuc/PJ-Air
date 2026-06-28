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
    findInRange(startDate: string, endDate: string, userId?: string): Promise<import("./order.entity").Order[]>;
    findOne(id: string): Promise<import("./order.entity").Order>;
    updateStatus(id: string, status: string): Promise<import("./order.entity").Order>;
    assignDelivery(id: string, deliveryUserId: string): Promise<import("./order.entity").Order>;
    update(id: string, body: any): Promise<import("./order.entity").Order>;
}
