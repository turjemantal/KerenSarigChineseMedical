import { PipeTransform } from '@nestjs/common';
import { ObjectSchema } from 'joi';
export declare class JoiValidationPipe implements PipeTransform {
    private readonly schema;
    constructor(schema: ObjectSchema);
    transform(value: unknown): any;
}
