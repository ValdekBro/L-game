import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  nickname: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  rating: number;

}

export const UserSchema = SchemaFactory.createForClass(User);