import { Injectable, NotFoundException } from '@nestjs/common';
import { uniq } from 'lodash';
import { ChatChannelMemberRepository } from 'src/domain/repositories/chat-channel-member.repository';
import { ChatChannelRepository } from 'src/domain/repositories/chat-channel.repository';
import { UserRepository } from 'src/domain/repositories/user.repository';
import { ChatChannelMemberRole } from 'src/domain/schemas/chat-channel-member.schema';
import { ChatChannelType, getDirectChatChannelKey } from 'src/domain/schemas/chat-channel.schema';

@Injectable()
export class ChatChannelsService {
  constructor(
    private readonly chatChannelRepo: ChatChannelRepository,
    private readonly chatChannelMemberRepo: ChatChannelMemberRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async createDirectChatChannel(reqBody: { userId: string; createdById: string }) {
    const { userId, createdById } = reqBody;
    const userIds = uniq([userId, createdById]);

    const users = await this.userRepo.findByIds(userIds);
    if (users.length !== userIds.length) {
      throw new NotFoundException('Unable to find all users.');
    }

    const key = getDirectChatChannelKey(userId, createdById);
    const existingChannel = await this.chatChannelRepo.findByKey({
      key: key,
      type: ChatChannelType.DIRECT,
    });
    if (existingChannel) return;

    const channel = this.chatChannelRepo.instance();
    channel.key = key;
    channel.type = ChatChannelType.DIRECT;
    channel.createdById = createdById;

    const members = users.map((user) => {
      const member = this.chatChannelMemberRepo.instance();
      member.chatChannelId = channel.id;
      member.userId = user.id;
      member.role = ChatChannelMemberRole.MODERATOR;
      return member;
    });

    await this.chatChannelRepo.create(channel);
    await this.chatChannelMemberRepo.insertMany(members);
  }

  async addGroupChatChannelMember(reqBody: { userId: string; chatChannelKey: string }) {
    const { userId, chatChannelKey } = reqBody;
    const channel = await this.chatChannelRepo.findByKey({
      key: chatChannelKey,
      type: ChatChannelType.GROUP,
    });
    if (!channel) {
      throw new NotFoundException('Unable to find Chat group.');
    }

    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('Unable to find user.');
    }

    const existingMember = await this.chatChannelMemberRepo.findByChannelIdAndUserId({
      channelId: channel.id,
      userId: user.id,
    });
    if (existingMember) return;

    const member = this.chatChannelMemberRepo.instance();
    member.chatChannelId = channel.id;
    member.userId = user.id;
    member.role = ChatChannelMemberRole.VIEWER;

    await this.chatChannelMemberRepo.insertMany([member]);
  }
}
