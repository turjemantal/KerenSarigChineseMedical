import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { JoiBody } from '../common/guards/joi-body.decorator';
import { requestOtpSchema, verifyOtpSchema, adminLoginSchema, updateNameSchema } from './validations/auth.schemas';

interface AuthUser { clientId: string; phone: string; name?: string }

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin')
  @JoiBody(adminLoginSchema)
  adminLogin(@Body() body: { password: string }) {
    return this.authService.adminLogin(body.password);
  }

  @Post('request-otp')
  @JoiBody(requestOtpSchema)
  requestOtp(@Body() body: { phone: string }) {
    return this.authService.requestOtp(body.phone);
  }

  @Post('verify-otp')
  @JoiBody(verifyOtpSchema)
  verifyOtp(@Body() body: { phone: string; code: string; name?: string }) {
    return this.authService.verifyOtp(body.phone, body.code, body.name);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/name')
  @JoiBody(updateNameSchema)
  updateName(@CurrentUser() user: AuthUser, @Body() body: { name: string }) {
    return this.authService.updateName(user.phone, body.name);
  }
}
