import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_SECRET_FALLBACK } from '../common/constants/jwt.constants';

export interface JwtPayload {
  sub: string;
  phone: string;
  name?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || JWT_SECRET_FALLBACK,
    });
  }

  validate(payload: JwtPayload) {
    return { clientId: payload.sub, phone: payload.phone, name: payload.name };
  }
}
