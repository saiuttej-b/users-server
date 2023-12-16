import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { uniq } from 'lodash';
import { ChatChannelMemberRepository } from 'src/domain/repositories/chat-channel-member.repository';
import { ChatChannelRepository } from 'src/domain/repositories/chat-channel.repository';
import { UserRepository } from 'src/domain/repositories/user.repository';
import { ChatChannelMemberRole } from 'src/domain/schemas/chat-channel-member.schema';
import {
  ChatChannel,
  ChatChannelType,
  getDirectChatChannelId,
} from 'src/domain/schemas/chat-channel.schema';
import { MediaResourcesService } from 'src/media-resources/services/media-resources.service';
import { getUser } from 'src/utils/request-store/request-store';
import { generateId } from 'src/utils/util-functions';
import {
  GroupChatChannelPostDto,
  UpdateChatChannelMemberRoleDto,
} from '../dtos/chat-channel-post.dto';

@Injectable()
export class ChatChannelsService {
  constructor(
    private readonly chatChannelRepo: ChatChannelRepository,
    private readonly chatChannelMemberRepo: ChatChannelMemberRepository,
    private readonly userRepo: UserRepository,
    private readonly mediaResourcesService: MediaResourcesService,
  ) {}

  async createDirectChatChannel(reqBody: { userId: string; createdById: string }) {
    const { userId, createdById } = reqBody;
    const userIds = uniq([userId, createdById]);

    const users = await this.userRepo.findByIds(userIds);
    if (users.length !== userIds.length) {
      throw new NotFoundException('Unable to find all users.');
    }

    const id = getDirectChatChannelId(userId, createdById);
    const existingChannel = await this.chatChannelRepo.findById({
      id: id,
      type: ChatChannelType.DIRECT,
    });
    if (existingChannel) return;

    const channel = this.chatChannelRepo.instance();
    channel.id = id;
    channel.type = ChatChannelType.DIRECT;
    channel.createdById = createdById;
    channel.createdAt = new Date();

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

  async addGroupChatChannelMember(reqBody: { userId: string; chatChannelId: string }) {
    const { userId, chatChannelId } = reqBody;

    // validating chat group
    const channel = await this.chatChannelRepo.findById({
      id: chatChannelId,
      type: ChatChannelType.GROUP,
    });
    if (!channel) {
      throw new NotFoundException('Unable to find Chat group.');
    }

    // validating user
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('Unable to find user.');
    }

    // checking whether the request initiator is already a member of the chat group
    const existingMember = await this.chatChannelMemberRepo.findByChannelIdAndUserId({
      chatChannelId: channel.id,
      userId: user.id,
    });
    if (existingMember) return;

    const member = this.chatChannelMemberRepo.instance();
    member.chatChannelId = channel.id;
    member.userId = user.id;
    member.role = ChatChannelMemberRole.VIEWER;

    await this.chatChannelMemberRepo.insertMany([member]);
  }

  async createGroupChatChannel(reqBody: GroupChatChannelPostDto) {
    const channel = this.chatChannelRepo.instance();
    channel.id = generateId();
    channel.type = ChatChannelType.GROUP;
    channel.name = reqBody.name;
    channel.description = reqBody.description;
    channel.createdById = getUser().id;
    channel.createdAt = new Date();

    const member = this.chatChannelMemberRepo.instance();
    member.chatChannelId = channel.id;
    member.userId = channel.createdById;
    member.role = ChatChannelMemberRole.OWNER;
    member.joinedAt = channel.createdAt;

    const result = await this.chatChannelRepo.create(channel);
    await this.chatChannelMemberRepo.insertMany([member]);

    return result;
  }

  private async canCurrentUserUpdateChatChannel(channel: ChatChannel) {
    // checking whether the request initiator is a member of the chat group
    const member = await this.chatChannelMemberRepo.findByChannelIdAndUserId({
      chatChannelId: channel.id,
      userId: getUser().id,
    });
    if (!member) {
      throw new BadRequestException('You are not a member of this chat group.');
    }

    // checking whether the request initiator has permission to update the chat group
    if (
      ![
        ChatChannelMemberRole.OWNER,
        ChatChannelMemberRole.ADMIN,
        ChatChannelMemberRole.MODERATOR,
      ].includes(member.role)
    ) {
      throw new BadRequestException(
        'You do not have permission to update this chat group details.',
      );
    }

    return { member };
  }

  async updateChatChannelDetails(reqBody: GroupChatChannelPostDto, id: string) {
    const channel = await this.chatChannelRepo.findById({ id, type: ChatChannelType.GROUP });
    if (!channel) {
      throw new NotFoundException('Unable to find Chat group.');
    }

    await this.canCurrentUserUpdateChatChannel(channel);

    channel.name = reqBody.name;
    channel.description = reqBody.description;

    return this.chatChannelRepo.save(channel, { updatedById: getUser().id });
  }

  async updateChatChannelAvatar(file: Express.Multer.File, id: string) {
    const channel = await this.chatChannelRepo.findById({ id, type: ChatChannelType.GROUP });
    if (!channel) {
      throw new NotFoundException('Unable to find Chat group.');
    }

    await this.canCurrentUserUpdateChatChannel(channel);

    const avatar = await this.mediaResourcesService.chatChannelAvatar.upload({
      file: file,
      typeId: channel.id,
      createdById: getUser().id,
    });

    channel.avatar = avatar;
    return this.chatChannelRepo.save(channel, { updatedById: getUser().id });
  }

  async updateChatChannelMemberRole(reqBody: UpdateChatChannelMemberRoleDto, id: string) {
    const channel = await this.chatChannelRepo.findById({ id, type: ChatChannelType.GROUP });
    if (!channel) {
      throw new NotFoundException('Unable to find Chat group.');
    }

    const { member } = await this.canCurrentUserUpdateChatChannel(channel);

    const roles = {
      [ChatChannelMemberRole.OWNER]: 0,
      [ChatChannelMemberRole.ADMIN]: 1,
      [ChatChannelMemberRole.MODERATOR]: 2,
    };
    const roleValue = (role: string) => roles[role] ?? Infinity;

    // checking whether the request initiator has permission to assign the role
    if (
      roleValue(member.role) >= roleValue(reqBody.role) &&
      member.role !== ChatChannelMemberRole.OWNER
    ) {
      throw new BadRequestException('You do not have permissions to assign this role.');
    }

    const targetMember = await this.chatChannelMemberRepo.findByChannelIdAndUserId({
      chatChannelId: channel.id,
      userId: reqBody.userId,
    });
    if (!targetMember) {
      throw new NotFoundException('Unable to find chat channel member.');
    }

    // checking whether there is any changes to be made
    if (targetMember.role === reqBody.role) {
      return {
        success: true,
        message: 'No changes made.',
      };
    }

    // if the request initiator is trying to assign the owner role to another member
    // then the request initiator's role will be changed to admin
    // and the target member's role will be changed to owner
    if (reqBody.role === ChatChannelMemberRole.OWNER) {
      // changing the request initiator's role to admin
      await this.chatChannelMemberRepo.updateRole({
        chatChannelId: channel.id,
        userId: member.userId,
        role: ChatChannelMemberRole.ADMIN,
      });

      // changing the target member's role to owner
      await this.chatChannelMemberRepo.updateRole({
        chatChannelId: channel.id,
        userId: targetMember.userId,
        role: ChatChannelMemberRole.OWNER,
      });

      return {
        success: true,
        message: 'Chat channel member role updated.',
      };
    }

    // checking whether the request initiator has permission to update the chat group member role
    if (roleValue(member.role) >= roleValue(targetMember.role)) {
      throw new BadRequestException(
        'You do not have permission to update this chat channel member role.',
      );
    }

    targetMember.role = reqBody.role;
    await this.chatChannelMemberRepo.updateRole({
      chatChannelId: channel.id,
      userId: targetMember.userId,
      role: targetMember.role,
    });

    return {
      success: true,
      message: 'Chat channel member role updated.',
    };
  }

  async getMyChatChannels() {
    return this.chatChannelRepo.findUserChatChannels({ userId: getUser().id });
  }
}
