import { DevtoolsService } from './devtools.service';
export declare class DevtoolsController {
    private devtoolsService;
    constructor(devtoolsService: DevtoolsService);
    seed(): Promise<import("../products/product.entity").Product[]>;
    seedAdmin(): Promise<{
        message: string;
        email: string;
    }>;
    seedReports(): Promise<{
        message: string;
        clients: number;
    }>;
}
