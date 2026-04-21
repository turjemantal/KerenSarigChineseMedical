import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { OtpDocument } from './otp.schema';
import { ClientsService } from '../clients/clients.service';
export declare class AuthService {
    private otpModel;
    private readonly jwtService;
    private readonly clientsService;
    constructor(otpModel: Model<OtpDocument>, jwtService: JwtService, clientsService: ClientsService);
    requestOtp(phone: string): Promise<{
        message: string;
    }>;
    updateName(phone: string, name: string): Promise<{
        token: string;
        client: object;
    }>;
    adminLogin(password: string): Promise<{
        token: string;
    }>;
    verifyOtp(phone: string, code: string, name?: string): Promise<{
        token: string;
        client: object;
    }>;
}
