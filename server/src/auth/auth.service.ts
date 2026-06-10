import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp, OtpDocument } from './otp.schema';
import { ClientsService } from '../clients/clients.service';
import { MESSAGING_PROVIDER } from '../integrations/messaging/messaging.token';
import { IMessagingProvider } from '../integrations/messaging/messaging-provider.interface';
import { OTP_CODE_MIN, OTP_CODE_RANGE } from '../common/constants/otp.constants';
import { ERRORS, Entity, notFoundMessage } from '../common/constants/errors.constants';
import { UserRole } from '../common/enums/user-role.enum';
import { config } from '../config';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { UpdateNameDto } from './dto/update-name.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    private readonly jwtService: JwtService,
    private readonly clientsService: ClientsService,
    @Inject(MESSAGING_PROVIDER) private readonly messaging: IMessagingProvider,
  ) {}

  async requestOtp(dto: RequestOtpDto): Promise<{ message: string }> {
    const code = Math.floor(OTP_CODE_MIN + Math.random() * OTP_CODE_RANGE).toString();
    await this.otpModel.deleteMany({ phone: dto.phone });
    await this.otpModel.create({ phone: dto.phone, code });
    await this.messaging.sendOtp(dto.phone, code);
    return { message: 'OTP sent' };
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
