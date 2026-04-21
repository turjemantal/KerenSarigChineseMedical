import { ObjectSchema } from 'joi';
export declare const JoiBody: (schema: ObjectSchema) => <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
