import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { getSetDefaultFn } from 'src/utils/util-functions';
import { MediaResource, MediaResourceSubSchema } from './media-resource.schema';
import { PermissionProfile, PermissionProfileSubSchema } from './permission-profile.schema';

export const UserCName = 'users';
export type UserDocument = HydratedDocument<User>;

@Schema({ collection: UserCName, timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  id: string;

  @Prop({ required: true, trim: true })
  username: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ trim: true })
  lastName?: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: false, set: getSetDefaultFn(false) })
  isSuperUser: boolean;

  @Prop({ default: true, set: getSetDefaultFn(true) })
  isActive: boolean;

  @Prop({ type: MediaResourceSubSchema })
  profilePicture?: MediaResource;

  @Prop({ default: [], set: getSetDefaultFn([]), type: [PermissionProfileSubSchema] })
  profiles: PermissionProfile[];

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ id: -1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ firstName: 'text', lastName: 'text', email: 'text', username: 'text' });
