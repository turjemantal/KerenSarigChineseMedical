import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { config } from '../config';
import { UserRole } from '../common/enums/user-role.enum';

export interface JwtPayload {
  sub: string;
  phone?: string;
  name?: string;
  role?: UserRole;
}

export interface AuthUser {
  clientId: string;
  phone: string;
  name?: string;
  role?: UserRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwt.secret,
    });
  }

  validate(payload: JwtPayload) {
    return { clientId: payload.sub, phone: payload.phone ?? '', name: payload.name, role: payload.role };
  }
}
