import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private User: Model<User>) {}

  async create(dto: User): Promise<User> {
    const createdCat = new this.User(dto);
    return createdCat.save();
  }

  async findAll(): Promise<User[]> {
    return this.User.find().exec();
  }

  async findByIds(ids: string[]) {
    return this.User.find({ '_id': { $in: ids} })
  }

  async findOne(email: string) {
    return this.User.findOne({ email }).exec();
  }

  async findTop5() {
    return this.User.find({}, null, { sort: { rating: -1 }, limit: 5 })
  }
}