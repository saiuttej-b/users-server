import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ChatChannel, ChatChannelType } from './chat-channel.schema';
import { User } from './user.schema';

export const ChatChannelInvitationStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
};

export const ChatChannelInvitationCName = 'chat_channel_invitations';
export type ChatChannelInvitationDocument = HydratedDocument<ChatChannelInvitation>;

@Schema({ collection: ChatChannelInvitationCName, timestamps: true })
export class ChatChannelInvitation {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  createdById: string;

  @Prop({
    required: true,
    enum: Object.values(ChatChannelInvitationStatus),
    default: ChatChannelInvitationStatus.PENDING,
  })
  status: string;

  @Prop({ required: true, enum: Object.values(ChatChannelType) })
  chatChannelType: string;

  @Prop({ required: true })
  chatChannelId: string;

  @Prop()
  message: string;

  @Prop()
  respondedMessage: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  respondedAt: Date;

  chatChannel?: ChatChannel;

  user?: User;

  createdBy?: User;
}

export const ChatChannelInvitationSchema = SchemaFactory.createForClass(ChatChannelInvitation);
ChatChannelInvitationSchema.index({ id: -1 }, { unique: true });
ChatChannelInvitationSchema.index({ userId: 1, status: 1, createdAt: -1 });
ChatChannelInvitationSchema.index({
  createdById: 1,
  status: 1,
  chatChannelId: 1,
  userId: 1,
  createdAt: -1,
});
