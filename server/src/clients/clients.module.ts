import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Client, ClientSchema } from './client.schema';
import { ClientsDao } from './clients.dao';
import { ClientsService } from './clients.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Client.name, schema: ClientSchema }])],
  providers: [ClientsDao, ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
