import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { convertDoc } from 'src/utils/mongoose.config';
import { generateTimestampId } from 'src/utils/util-functions';
import {
  MediaResource,
  MediaResourceSubSchema,
  formatMediaResourceObject,
} from './media-resource.schema';

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

  @Prop({ type: MediaResourceSubSchema })
  avatar?: MediaResource;

  @Prop()
  createdById: string;

  @Prop()
  createdAt: Date;
}

export const ChatChannelSchema = SchemaFactory.createForClass(ChatChannel);
ChatChannelSchema.index({ id: 1 }, { unique: true });

export function getDirectChatChannelId(userId1: string, userId2: string) {
  return [userId1, userId2].sort().join('--');
}

export function getGroupChatChannelId() {
  return generateTimestampId();
}

export function convertChatChannelDoc(channel: ChatChannelDocument): ChatChannel;
export function convertChatChannelDoc(channels: ChatChannelDocument[]): ChatChannel[];
export function convertChatChannelDoc(
  channel: ChatChannelDocument | ChatChannelDocument[],
): ChatChannel | ChatChannel[] {
  return convertDoc(() => new ChatChannel(), channel);
}

export function formatChatChannelObject(value: any): ChatChannel {
  if (!value) return value;

  delete value._id;
  delete value.__v;

  value.avatar = formatMediaResourceObject(value.avatar);

  return value;
}
