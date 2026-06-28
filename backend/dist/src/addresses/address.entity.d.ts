import { User } from '../users/user.entity';
export declare class Address {
    id: string;
    user_id: string;
    alias: string;
    address: string;
    zone: string;
    notes: string;
    city: string;
    lat: number;
    lng: number;
    refined_lat: number;
    refined_lng: number;
    is_default: boolean;
    is_temporary: boolean;
    user: User;
}
