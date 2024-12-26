import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { MessageModule } from '../messages/message.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MessageModule
  ],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {} 