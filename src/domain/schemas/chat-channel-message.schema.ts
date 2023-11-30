import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { convertDoc } from 'src/utils/mongoose.config';
import {
  MediaResource,
  MediaResourceSubSchema,
  formatMediaResourceObject,
} from './media-resource.schema';
import { User, formatUserObject } from './user.schema';

export const ChatChannelMessageCName = 'chat_channel_messages';
export type ChatChannelMessageDocument = HydratedDocument<ChatChannelMessage>;

@Schema({ collection: ChatChannelMessageCName, timestamps: true })
export class ChatChannelMessage {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  chatChannelId: string;

  @Prop({ required: true })
  createdById: string;

  @Prop()
  message: string;

  @Prop({ default: [], type: [MediaResourceSubSchema] })
  resources: MediaResource[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  createdBy?: User;
}

export const ChatChannelMessageSchema = SchemaFactory.createForClass(ChatChannelMessage);
ChatChannelMessageSchema.index({ id: -1 }, { unique: true });
ChatChannelMessageSchema.index({ chatChannelId: 1, createdAt: -1 });

export function convertChatChannelMessageDoc(
  channel: ChatChannelMessageDocument,
): ChatChannelMessage;
export function convertChatChannelMessageDoc(
  channels: ChatChannelMessageDocument[],
): ChatChannelMessage[];
export function convertChatChannelMessageDoc(
  channel: ChatChannelMessageDocument | ChatChannelMessageDocument[],
): ChatChannelMessage | ChatChannelMessage[] {
  return convertDoc(() => new ChatChannelMessage(), channel);
}

export function formatChatChannelMessageObject(value: any): ChatChannelMessage {
  if (!value) return value;

  delete value._id;
  delete value.__v;

  if (value.resources && value.resources.length) {
    value.resources = value.resources.map(formatMediaResourceObject);
  }

  if (value.createdBy) value.createdBy = formatUserObject(value.createdBy);

  return value;
}
