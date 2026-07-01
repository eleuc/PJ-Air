import { DevtoolsService } from './devtools.service';
export declare class DevtoolsController {
    private devtoolsService;
    constructor(devtoolsService: DevtoolsService);
    seed(): Promise<any[]>;
    seedAdmin(): Promise<{
        message: string;
        email: string;
    }>;
    seedReports(): Promise<{
        message: string;
        clients: number;
    }>;
}
