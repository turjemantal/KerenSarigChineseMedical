import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp, OtpDocument } from './otp.schema';
import { ClientsService } from '../clients/clients.service';
import { MESSAGING_PROVIDER } from '../integrations/messaging/messaging.token';
import { IMessagingProvider } from '../integrations/messaging/messaging-provider.interface';
import {
  OTP_CODE_MIN,
  OTP_CODE_RANGE,
  OTP_RESEND_COOLDOWN_MS,
  OTP_SEND_WINDOW_MS,
  OTP_MAX_SENDS_PER_WINDOW,
} from '../common/constants/otp.constants';
import { ERRORS, Entity, notFoundMessage } from '../common/constants/errors.constants';
import { UserRole } from '../common/enums/user-role.enum';
import { config } from '../config';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { UpdateNameDto } from './dto/update-name.dto';

// mask a phone in logs: 0501234567 → 050***4567 (never log full numbers)
const maskPhone = (p: string): string => (p.length < 7 ? '***' : `${p.slice(0, 3)}***${p.slice(-4)}`);

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    private readonly jwtService: JwtService,
    private readonly clientsService: ClientsService,
    @Inject(MESSAGING_PROVIDER) private readonly messaging: IMessagingProvider,
  ) {}

  async requestOtp(dto: RequestOtpDto): Promise<{ message: string }> {
    await this.assertPhoneSendAllowed(dto.phone);
    const code = Math.floor(OTP_CODE_MIN + Math.random() * OTP_CODE_RANGE).toString();
    // Keep prior codes in the window so the per-phone cap can count them; the most
    // recent valid code still verifies, and the TTL index cleans expired ones up.
    await this.otpModel.create({ phone: dto.phone, code });
    await this.messaging.sendOtp(dto.phone, code);
    this.logger.log(`[OTP] sent to ${maskPhone(dto.phone)}`);
    return { message: 'OTP sent' };
  }

  // Per-phone SMS protection (defends even when the attacker rotates IPs):
  // a cooldown between sends + a hard cap within a rolling window.
  private async assertPhoneSendAllowed(phone: string): Promise<void> {
    const since = new Date(Date.now() - OTP_SEND_WINDOW_MS);
    const recent = await this.otpModel
      .find({ phone, createdAt: { $gte: since } })
      .sort({ createdAt: -1 })
      .exec();

    if (recent.length >= OTP_MAX_SENDS_PER_WINDOW) {
      this.logger.warn(`[OTP] daily cap hit for ${maskPhone(phone)} (${recent.length} sends) — possible abuse`);
      throw new HttpException(ERRORS.OTP_DAILY_LIMIT, HttpStatus.TOO_MANY_REQUESTS);
    }
    const last = recent[0];
    if (last && Date.now() - last.createdAt.getTime() < OTP_RESEND_COOLDOWN_MS) {
      this.logger.warn(`[OTP] cooldown blocked resend for ${maskPhone(phone)}`);
      throw new HttpException(ERRORS.OTP_COOLDOWN, HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<{ token: string; client: object }> {
    const otp = await this.otpModel.findOne({ phone: dto.phone, code: dto.code }).exec();
    if (!otp || otp.expiresAt < new Date()) {
      throw new BadRequestException(ERRORS.INVALID_OR_EXPIRED_OTP);
    }

    await this.otpModel.deleteMany({ phone: dto.phone });

    const client = await this.clientsService.findOrCreate(dto.phone, dto.name);

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

  async adminLogin(dto: AdminLoginDto): Promise<{ token: string }> {
    if (dto.password !== config.adminPassword) throw new UnauthorizedException(ERRORS.WRONG_PASSWORD);
    const token = this.jwtService.sign({ sub: UserRole.ADMIN, role: UserRole.ADMIN }, { expiresIn: config.jwt.adminExpiry });
    return { token };
  }

  async updateName(phone: string, dto: UpdateNameDto): Promise<{ token: string; client: object }> {
    const client = await this.clientsService.updateName(phone, dto.name);
    if (!client) throw new BadRequestException(notFoundMessage(Entity.Client, phone));
    const token = this.jwtService.sign({ sub: String(client._id), phone: client.phone, name: client.name });
    return { token, client: { _id: client._id, phone: client.phone, name: client.name, email: client.email } };
  }
}
