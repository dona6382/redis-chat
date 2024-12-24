import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatModule } from './chat/chat.module';
import { UserModule } from './users/user.module';
import { MessageModule } from './messages/message.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/redis-chat', {
    }),
    ChatModule,
    UserModule,
    MessageModule,
  ],
})
export class AppModule {}
