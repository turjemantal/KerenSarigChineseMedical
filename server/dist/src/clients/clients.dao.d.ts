import { Model } from 'mongoose';
import { ClientDocument } from './client.schema';
export declare class ClientsDao {
    private model;
    constructor(model: Model<ClientDocument>);
    findByPhone(phone: string): Promise<ClientDocument | null>;
    create(phone: string, name?: string, email?: string): Promise<ClientDocument>;
    update(phone: string, name: string): Promise<ClientDocument | null>;
}
