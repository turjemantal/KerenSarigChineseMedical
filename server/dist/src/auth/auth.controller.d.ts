import { AuthService } from './auth.service';
interface AuthUser {
    clientId: string;
    phone: string;
    name?: string;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    adminLogin(body: {
        password: string;
    }): Promise<{
        token: string;
    }>;
    requestOtp(body: {
        phone: string;
    }): Promise<{
        message: string;
    }>;
    verifyOtp(body: {
        phone: string;
        code: string;
        name?: string;
    }): Promise<{
        token: string;
        client: object;
    }>;
    updateName(user: AuthUser, body: {
        name: string;
    }): Promise<{
        token: string;
        client: object;
    }>;
}
export {};
