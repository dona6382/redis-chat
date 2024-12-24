import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createUser(username: string): Promise<User> {
    const user = new this.userModel({ username });
    return user.save();
  }

  async updateUserStatus(userId: string, isOnline: boolean): Promise<User> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { isOnline },
      { new: true },
    );
  }
} 