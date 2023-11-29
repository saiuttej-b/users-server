import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { convertDoc } from 'src/utils/mongoose.config';
import { ChatChannelMemberRepository } from '../repositories/chat-channel-member.repository';
import {
  ChatChannelMember,
  ChatChannelMemberDocument,
} from '../schemas/chat-channel-member.schema';

@Injectable()
export class MongoDBChatChannelMemberRepository implements ChatChannelMemberRepository {
  constructor(
    @InjectModel(ChatChannelMember.name) private readonly model: Model<ChatChannelMember>,
  ) {}

  instance(data?: Partial<ChatChannelMember>): ChatChannelMember {
    const member = new ChatChannelMember();
    if (data) Object.assign(member, data);

    return member;
  }

  async insertMany(members: ChatChannelMember[]): Promise<void> {
    if (!members.length) return;

    members.forEach((member) => {
      if (!member.joinedAt) member.joinedAt = new Date();
    });

    await this.model.insertMany(members);
  }

  async updateRole(props: { chatChannelId: string; userId: string; role: string }): Promise<void> {
    await this.model
      .updateOne(
        {
          chatChannelId: props.chatChannelId,
          userId: props.userId,
        },
        {
          $set: { role: props.role },
        },
      )
      .exec();
  }

  async findByChannelIdAndUserId(props: {
    chatChannelId: string;
    userId: string;
  }): Promise<ChatChannelMember> {
    const member = await this.model
      .findOne({
        chatChannelId: props.chatChannelId,
        userId: props.userId,
      })
      .exec();

    return this.convert(member);
  }

  async findByChannelIdAndUserIds(props: {
    chatChannelId: string;
    userIds: string[];
  }): Promise<ChatChannelMember[]> {
    if (!props.userIds.length) return [];

    const members = await this.model
      .find({
        chatChannelId: props.chatChannelId,
        userId: { $in: props.userIds },
      })
      .exec();

    return this.convert(members);
  }

  private convert(value: ChatChannelMemberDocument): ChatChannelMember;
  private convert(value: ChatChannelMemberDocument[]): ChatChannelMember[];
  private convert(
    value: ChatChannelMemberDocument | ChatChannelMemberDocument[],
  ): ChatChannelMember | ChatChannelMember[] {
    return convertDoc(() => new ChatChannelMember(), value);
  }
}
