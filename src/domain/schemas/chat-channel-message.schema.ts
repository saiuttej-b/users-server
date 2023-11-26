import { Prop, Schema } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { MediaResource, MediaResourceSubSchema } from './media-resource.schema';

export const ChatChannelMessageCName = 'chat_channel_messages';
export type ChatChannelMessageDocument = HydratedDocument<ChatChannelMessage>;

@Schema({ collection: ChatChannelMessageCName })
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
}
