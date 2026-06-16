import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Client, ClientSchema } from './client.schema';
import { ClientsDao } from './clients.dao';
import { ClientsService } from './clients.service';
import { ClientsManager } from './clients.manager';
import { ClientsController } from './clients.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Client.name, schema: ClientSchema }])],
  controllers: [ClientsController],
  providers: [ClientsDao, ClientsService, ClientsManager],
  exports: [ClientsService, ClientsManager],
})
export class ClientsModule {}
