import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin')
  adminLogin(@Body(new JoiValidationPipe(adminLoginSchema)) dto: AdminLoginDto) {
    return this.authService.adminLogin(dto);
  }

  @Post('request-otp')
  requestOtp(@Body(new JoiValidationPipe(requestOtpSchema)) dto: RequestOtpDto) {
    return this.authService.requestOtp(dto);
  }

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
