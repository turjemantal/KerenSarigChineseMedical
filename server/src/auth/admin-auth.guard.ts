import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthUser } from './jwt.strategy';
import { ERRORS } from '../common/constants/errors.constants';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class AdminAuthGuard extends AuthGuard('jwt') {
  handleRequest<T extends AuthUser>(err: Error | null, user: T | false) {
    if (err || !user) throw err ?? new UnauthorizedException();
    if (user.role !== UserRole.ADMIN) throw new UnauthorizedException(ERRORS.ADMIN_ACCESS_REQUIRED);
    return user;
  }
}
