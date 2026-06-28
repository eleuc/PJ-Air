import { AddressesService } from './addresses.service';
export declare class AddressesController {
    private readonly addressesService;
    constructor(addressesService: AddressesService);
    create(body: any): Promise<import("./address.entity").Address[]>;
    findByUser(userId: string): Promise<import("./address.entity").Address[]>;
    update(id: string, body: any): Promise<import("./address.entity").Address>;
    delete(id: string): Promise<import("./address.entity").Address>;
}
