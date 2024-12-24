import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './schemas/message.schema';
import { ChatMessageDto } from '../chat/dto/chat-message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
  ) {}

  async saveMessage(messageDto: ChatMessageDto): Promise<Message> {
    const message = new this.messageModel(messageDto);
    return message.save();
  }

  async getRoomMessages(roomId: string, limit = 50): Promise<Message[]> {
    return this.messageModel
      .find({ roomId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
} 