import { UsersService } from '../users/users.service';
export declare class AuthService {
    private usersService;
    constructor(usersService: UsersService);
    signup(body: any): Promise<{
        message: string;
        user: {
            id: any;
            email: any;
            app_metadata: {};
            user_metadata: {
                full_name: any;
            };
            aud: string;
            created_at: string;
        };
        session: {
            access_token: string;
            refresh_token: string;
            expires_in: number;
            token_type: string;
            user: {
                id: any;
                email: any;
            };
        };
    }>;
    login(identifierInput: string, password: string): Promise<{
        user: {
            id: string;
            email: string;
            app_metadata: {};
            user_metadata: {
                full_name: string;
                role: any;
            };
            aud: string;
            created_at: string;
        };
        session: {
            access_token: string;
            refresh_token: string;
            expires_in: number;
            token_type: string;
            user: {
                id: string;
                email: string;
            };
        };
    }>;
    recoverPassword(identifier: string): Promise<{
        message: string;
        email: string;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
}
