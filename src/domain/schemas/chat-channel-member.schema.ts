import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export const ChatChannelMemberRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER',
};

export const ChatChannelMemberCName = 'chat_channel_members';
export type ChatChannelMemberDocument = HydratedDocument<ChatChannelMember>;

@Schema({ collection: ChatChannelMemberCName })
export class ChatChannelMember {
  @Prop({ required: true })
  chatChannelId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, default: ChatChannelMemberRole.MEMBER })
  role: string;

  @Prop()
  joinedAt: Date;

  @Prop()
  lastSeenAt: Date;
}

export const ChatChannelMemberSchema = SchemaFactory.createForClass(ChatChannelMember);
ChatChannelMemberSchema.index({ chatChannelId: 1, userId: 1 }, { unique: true });
ChatChannelMemberSchema.index({ userId: 1 });
