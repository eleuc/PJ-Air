import { Order } from './order.entity';
export declare class ExcelService {
    exportIndividual(orders: Order[]): Buffer;
    exportConsolidated(orders: Order[]): Buffer;
}
