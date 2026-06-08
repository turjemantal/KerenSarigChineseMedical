import { Global, Module } from '@nestjs/common';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { SmsModule } from '../sms/sms.module';
import { WhatsappMessagingProvider } from '../whatsapp/whatsapp-messaging.provider';
import { SmsMessagingProvider } from '../sms/sms-messaging.provider';
import { IMessagingProvider } from './messaging-provider.interface';
import { MESSAGING_PROVIDER } from './messaging.token';
import { MessagingProvider } from '../../common/enums/messaging-provider.enum';
import { config } from '../../config';

@Global()
@Module({
  imports: [WhatsappModule, SmsModule],
  providers: [
    WhatsappMessagingProvider,
    SmsMessagingProvider,
    {
      provide: MESSAGING_PROVIDER,
      useFactory: (whatsapp: WhatsappMessagingProvider, sms: SmsMessagingProvider): IMessagingProvider =>
        config.messaging.provider === MessagingProvider.Sms ? sms : whatsapp,
      inject: [WhatsappMessagingProvider, SmsMessagingProvider],
    },
  ],
  exports: [MESSAGING_PROVIDER],
})
export class MessagingModule {}
