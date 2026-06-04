import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthUser } from './jwt.strategy';

@Injectable()
export class AdminAuthGuard extends AuthGuard('jwt') {
  handleRequest<T extends AuthUser>(err: Error | null, user: T | false) {
    if (err || !user) throw err ?? new UnauthorizedException();
    if (user.role !== 'admin') throw new UnauthorizedException('Admin access required');
    return user;
  }
}
