import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { AuthUser } from './jwt.strategy';
import { JoiValidationPipe } from '../common/pipes/joi-validation.pipe';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { UpdateNameDto } from './dto/update-name.dto';
import { requestOtpSchema, verifyOtpSchema, adminLoginSchema, updateNameSchema } from './dto/validations/auth.schemas';
import { OTP_IP_PER_MINUTE, OTP_IP_PER_HOUR } from '../common/constants/otp.constants';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ minute: { limit: 10 } })
  @Post('admin')
  adminLogin(@Body(new JoiValidationPipe(adminLoginSchema)) dto: AdminLoginDto) {
    return this.authService.adminLogin(dto);
  }

  // Each OTP send costs real money (SMS) — cap hard per IP, on both windows.
  @Throttle({
    minute: { limit: OTP_IP_PER_MINUTE },
    hour: { limit: OTP_IP_PER_HOUR },
  })
  @Post('request-otp')
  requestOtp(@Body(new JoiValidationPipe(requestOtpSchema)) dto: RequestOtpDto) {
    return this.authService.requestOtp(dto);
  }

  @Throttle({ minute: { limit: 10 } })
  @Post('verify-otp')
  verifyOtp(@Body(new JoiValidationPipe(verifyOtpSchema)) dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/name')
  updateName(
    @CurrentUser() user: AuthUser,
    @Body(new JoiValidationPipe(updateNameSchema)) dto: UpdateNameDto,
  ) {
    return this.authService.updateName(user.phone, dto);
  }
}
