import { CanActivate, ExecutionContext, Injectable, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ObjectSchema } from 'joi';

export const JOI_SCHEMA_KEY = 'joi_schema';

@Injectable()
export class JoiValidationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const schema = this.reflector.get<ObjectSchema>(JOI_SCHEMA_KEY, context.getHandler());
    if (!schema) return true;

    const req = context.switchToHttp().getRequest();
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      throw new BadRequestException(error.details.map(d => d.message).join('; '));
    }

    req.body = value;
    return true;
  }
}
