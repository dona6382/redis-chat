import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  username: string;

  @Prop({ default: false })
  isOnline: boolean;

  @Prop({ default: [] })
  rooms: string[];
}

export const UserSchema = SchemaFactory.createForClass(User); 