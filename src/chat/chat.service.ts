import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ChatMessageDto } from './dto/chat-message.dto';
import { MessageService } from '../messages/message.service';

@Injectable()
export class ChatService {
  private readonly redis: Redis;

  constructor(private readonly messageService: MessageService) {
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }

  async broadcastMessage(message: ChatMessageDto): Promise<void> {
    try {
      // MongoDB에 메시지 저장 (await로 확실히 기다림)
      const savedMessage = await this.messageService.saveMessage(message);
      
      // Redis에 메시지 발행
      await this.redis.publish('chat_messages', JSON.stringify(savedMessage));
      
      console.log('Message saved and broadcasted:', savedMessage);
    } catch (error) {
      console.error('Error in broadcastMessage:', error);
      throw error;
    }
  }
} 