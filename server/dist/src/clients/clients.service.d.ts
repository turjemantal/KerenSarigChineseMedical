import { ClientsDao } from './clients.dao';
import { ClientDocument } from './client.schema';
export declare class ClientsService {
    private readonly dao;
    constructor(dao: ClientsDao);
    findByPhone(phone: string): Promise<ClientDocument | null>;
    findOrCreate(phone: string, name?: string): Promise<ClientDocument>;
    updateName(phone: string, name: string): Promise<ClientDocument | null>;
}
