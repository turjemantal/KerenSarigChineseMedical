import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ObjectSchema } from 'joi';
import { JoiValidationGuard, JOI_SCHEMA_KEY } from './joi-validation.guard';

export const JoiBody = (schema: ObjectSchema) =>
  applyDecorators(
    SetMetadata(JOI_SCHEMA_KEY, schema),
    UseGuards(JoiValidationGuard),
  );
