import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { generateTimestampId } from 'src/utils/util-functions';

export const ChatChannelType = {
  GROUP: 'GROUP',
  DIRECT: 'DIRECT',
};

export const ChatChannelCName = 'chat_channels';
export type ChatChannelDocument = HydratedDocument<ChatChannel>;

@Schema({ collection: ChatChannelCName })
export class ChatChannel {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true, enum: Object.values(ChatChannelType) })
  type: string;

  @Prop({ trim: true })
  name: string;

  @Prop({ trim: true })
  description: string;

  @Prop()
  createdById: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ChatChannelSchema = SchemaFactory.createForClass(ChatChannel);
ChatChannelSchema.index({ id: 1 }, { unique: true });

export function getDirectChatChannelId(userId1: string, userId2: string) {
  return [userId1, userId2].sort().join('--');
}

export function getGroupChatChannelId() {
  return generateTimestampId();
}
