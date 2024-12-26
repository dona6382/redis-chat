import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ChatMessageDto } from './dto/chat-message.dto';
import { MessageService } from '../messages/message.service';
import * as CryptoJS from 'crypto-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatService {
  private readonly redis: Redis;
  private readonly secretKey: string;

  constructor(
    private readonly messageService: MessageService,
    private readonly configService: ConfigService,
  ) {
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
    });
    this.secretKey = this.configService.get<string>('ENCRYPTION_KEY');
    
    if (!this.secretKey) {
      throw new Error('ENCRYPTION_KEY is not defined');
    }
  }

  private encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, this.secretKey.trim()).toString();
  }

  private decrypt(encryptedText: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedText, this.secretKey.trim());
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      return '복호화 실패';
    }
  }

  async broadcastMessage(message: ChatMessageDto): Promise<void> {
    try {
      const messageForStorage = { ...message };
      
      // DB 저장용 메시지 암호화
      messageForStorage.content = this.encrypt(message.content);
      const savedMessage = await this.messageService.saveMessage(messageForStorage);
      
      // 실시간 채팅(Redis) 메시지는 원본 그대로 사용
      await this.redis.publish('chat_messages', JSON.stringify({
        ...message,
        id: savedMessage._id // MongoDB에서 생성된 ID 포함
      }));
      
      console.log('Encrypted Message saved :', {
        encrypted: messageForStorage.content
      });
    } catch (error) {
      console.error('Error in broadcastMessage:', error);
      throw error;
    }
  }

  // 메시지 조회 시 복호화하는 메서드 추가
  async getDecryptedMessages(roomId: string): Promise<ChatMessageDto[]> {
    const messages = await this.messageService.getRoomMessages(roomId);
    return messages.map(msg => ({
      ...msg,
      content: this.decrypt(msg.content)
    }));
  } 
} 