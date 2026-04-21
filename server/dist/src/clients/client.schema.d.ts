import { HydratedDocument } from 'mongoose';
export type ClientDocument = HydratedDocument<Client>;
export declare class Client {
    phone: string;
    name: string;
    email: string;
}
export declare const ClientSchema: import("mongoose").Schema<Client, import("mongoose").Model<Client, any, any, any, import("mongoose").Document<unknown, any, Client, any, {}> & Client & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Client, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Client>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Client> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
