import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { MessageModule } from '../messages/message.module';
import { UserModule } from '../users/user.module';

@Module({
  imports: [MessageModule, UserModule],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {} 