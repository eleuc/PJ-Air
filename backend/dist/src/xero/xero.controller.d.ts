import { XeroService } from './xero.service';
import type { Response } from 'express';
export declare class XeroController {
    private readonly xeroService;
    constructor(xeroService: XeroService);
    connect(res: Response): Promise<void>;
    callback(code: string, res: Response): Promise<void>;
    syncOrder(orderId: string): Promise<{
        success: boolean;
        invoiceId?: string;
    }>;
    syncBatch(): Promise<{
        processed: number;
        successCount: number;
    }>;
}
