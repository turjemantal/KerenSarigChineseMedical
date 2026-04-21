import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp, OtpDocument } from './otp.schema';
import { ClientsService } from '../clients/clients.service';
import { OTP_CODE_MIN, OTP_CODE_RANGE } from '../common/constants/otp.constants';
import { JWT_ADMIN_EXPIRY } from '../common/constants/jwt.constants';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    private readonly jwtService: JwtService,
    private readonly clientsService: ClientsService,
  ) {}

  async requestOtp(phone: string): Promise<{ message: string }> {
    const code = Math.floor(OTP_CODE_MIN + Math.random() * OTP_CODE_RANGE).toString();
    await this.otpModel.deleteMany({ phone });
    await this.otpModel.create({ phone, code });

    // TODO: send via SMS provider (Twilio / MessageBird)
    console.log(`[OTP] ${phone} → ${code}`);

    return { message: 'OTP sent' };
  }

  async updateName(phone: string, name: string): Promise<{ token: string; client: object }> {
    const client = await this.clientsService.updateName(phone, name);
    if (!client) throw new BadRequestException('Client not found');
    const token = this.jwtService.sign({ sub: String(client._id), phone: client.phone, name: client.name });
    return { token, client: { _id: client._id, phone: client.phone, name: client.name, email: client.email } };
  }

  async adminLogin(password: string): Promise<{ token: string }> {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected || password !== expected) throw new UnauthorizedException('סיסמה שגויה');
    const token = this.jwtService.sign({ sub: 'admin', role: 'admin' }, { expiresIn: JWT_ADMIN_EXPIRY });
    return { token };
  }

  async verifyOtp(phone: string, code: string, name?: string): Promise<{ token: string; client: object }> {
    const otp = await this.otpModel.findOne({ phone, code }).exec();
    if (!otp || otp.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    await this.otpModel.deleteMany({ phone });

    const client = await this.clientsService.findOrCreate(phone, name);

    const token = this.jwtService.sign({
      sub: String(client._id),
      phone: client.phone,
      name: client.name,
    });

    return {
      token,
      client: {
        _id: client._id,
        phone: client.phone,
        name: client.name,
        email: client.email,
      },
    };
  }
}
