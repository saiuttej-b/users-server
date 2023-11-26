import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { uniq } from 'lodash';
import { ChatChannelsService } from 'src/chat-channels/services/chat-channels.service';
import { ChatChannelInvitationRepository } from 'src/domain/repositories/chat-channel-invitation.repository';
import { ChatChannelMemberRepository } from 'src/domain/repositories/chat-channel-member.repository';
import { ChatChannelRepository } from 'src/domain/repositories/chat-channel.repository';
import { UserRepository } from 'src/domain/repositories/user.repository';
import { ChatChannelInvitationStatus } from 'src/domain/schemas/chat-channel-invitation.schema';
import { ChatChannelMemberRole } from 'src/domain/schemas/chat-channel-member.schema';
import { ChatChannelType, getDirectChatChannelId } from 'src/domain/schemas/chat-channel.schema';
import { getUser } from 'src/utils/request-store/request-store';
import {
  FindUserForChatChannelInvitationDto,
  GetChatChannelInvitationsDto,
  RespondToChatChannelInvitationDto,
  SendChatChannelInvitationDto,
} from '../dtos/chat-channel-invitation.dto';

@Injectable()
export class ChatChannelInvitationsService {
  constructor(
    private readonly chatChannelInvitationRepo: ChatChannelInvitationRepository,
    private readonly chatChannelRepo: ChatChannelRepository,
    private readonly chatChannelMemberRepo: ChatChannelMemberRepository,
    private readonly userRepo: UserRepository,

    private readonly chatChannelsService: ChatChannelsService,
  ) {}

  async sendChatChannelInvitations(reqBody: SendChatChannelInvitationDto) {
    // validating request user ids to be unique and checking whether all users exist
    const userIds = uniq(reqBody.userIds);
    let users = await this.userRepo.findByIds(userIds);
    if (users.length !== userIds.length) {
      throw new NotFoundException('Unable to find all users.');
    }

    // set of validation rules for chat group invitation
    if (reqBody.channelType === ChatChannelType.GROUP) {
      // validating chat group
      const channel = await this.chatChannelRepo.findById({
        id: reqBody.chatChannelId,
        type: ChatChannelType.GROUP,
      });
      if (!channel) {
        throw new NotFoundException('Unable to find Chat group.');
      }

      // checking whether the request initiator is a member of the chat group
      const member = await this.chatChannelMemberRepo.findByChannelIdAndUserId({
        chatChannelId: channel.id,
        userId: getUser().id,
      });
      if (!member) {
        throw new BadRequestException('You are not a member of this chat group.');
      }
      // checking whether the request initiator has permission to invite users to the chat group
      if (![ChatChannelMemberRole.MEMBER, ChatChannelMemberRole.VIEWER].includes(member.role)) {
        throw new BadRequestException(
          "You don't have permission to invite users to this chat group.",
        );
      }

      // finding existing members of the chat group
      const existingMembers = await this.chatChannelMemberRepo.findByChannelIdAndUserIds({
        chatChannelId: channel.id,
        userIds: reqBody.userIds,
      });
      const existingMemberIds = existingMembers.map((m) => m.userId);

      // removing existing members from the list of users to be invited
      users = users.filter((u) => !existingMemberIds.includes(u.id));
    }

    // set of validation rules for direct chat invitation
    if (reqBody.channelType === ChatChannelType.DIRECT) {
      const existingChats = await this.chatChannelRepo.findByIds({
        ids: userIds.map((userId) => getDirectChatChannelId(userId, getUser().id)),
        type: ChatChannelType.DIRECT,
      });
      const existingUserIds = existingChats.map((c) => {
        const ids = c.id.split('--');
        return ids[0] === getUser().id ? ids[1] : ids[0];
      });

      // removing existing chats from the list of users to be invited
      users = users.filter((u) => !existingUserIds.includes(u.id));
    }

    // returning if all users are already members of the chat group or have a direct chat with the request initiator
    if (!users.length) {
      return {
        success: true,
        message:
          reqBody.channelType === ChatChannelType.GROUP
            ? 'All users are already members of this chat group.'
            : 'All users already have a direct chat with you.',
      };
    }

    // deleting previous pending invitations for the users to be invited
    await this.chatChannelInvitationRepo.deleteByPreviousPendingInvitations({
      createdById: getUser().id,
      values: users.map((user) => ({
        userId: user.id,
        chatChannelId:
          reqBody.channelType === ChatChannelType.GROUP
            ? reqBody.chatChannelId
            : getDirectChatChannelId(user.id, getUser().id),
      })),
    });

    // creating new invitations
    const invitations = users.map((user) => {
      const invitation = this.chatChannelInvitationRepo.instance();
      invitation.userId = user.id;
      invitation.createdById = getUser().id;
      invitation.status = ChatChannelInvitationStatus.PENDING;
      invitation.chatChannelType = reqBody.channelType;
      invitation.chatChannelId =
        reqBody.channelType === ChatChannelType.GROUP
          ? reqBody.chatChannelId
          : getDirectChatChannelId(user.id, getUser().id);
      invitation.message = reqBody.message;
      return invitation;
    });

    // saving invitations
    await this.chatChannelInvitationRepo.insertMany(invitations);

    return {
      success: true,
      message: 'Invitations sent successfully.',
    };
  }

  async respondToChatChannelInvitation(reqBody: RespondToChatChannelInvitationDto) {
    // validating invitation
    const invitation = await this.chatChannelInvitationRepo.findById(reqBody.invitationId);
    if (!invitation) {
      throw new NotFoundException('Unable to find chat invitation.');
    }

    // checking whether the request initiator is the recipient of the invitation
    if (invitation.userId !== getUser().id) {
      throw new BadRequestException('You do not have permission to respond to this invitation.');
    }

    // checking whether the invitation is still pending
    if (invitation.status !== ChatChannelInvitationStatus.PENDING) {
      throw new BadRequestException('You have already responded to this invitation.');
    }

    if (reqBody.response === ChatChannelInvitationStatus.ACCEPTED) {
      if (invitation.chatChannelType === ChatChannelType.GROUP) {
        // adding user to the chat group
        await this.chatChannelsService.addGroupChatChannelMember({
          userId: invitation.userId,
          chatChannelId: invitation.chatChannelId,
        });
      }

      if (invitation.chatChannelType === ChatChannelType.DIRECT) {
        // creating direct chat channel
        await this.chatChannelsService.createDirectChatChannel({
          userId: invitation.createdById,
          createdById: invitation.userId,
        });
      }
    }

    // updating invitation response
    await this.chatChannelInvitationRepo.updateResponse({
      invitationId: reqBody.invitationId,
      response: reqBody.response,
      message: reqBody.message,
    });

    return {
      success: true,
      message: 'Invitation responded successfully.',
    };
  }

  async getMyChatChannelInvitations(query: GetChatChannelInvitationsDto) {
    query.userId = getUser().id;
    return this.chatChannelInvitationRepo.find(query);
  }

  async findUserForChatChannelInvitation(query: FindUserForChatChannelInvitationDto) {
    const user = await this.userRepo.findByCredentials(query.loginId);
    if (!user) {
      return {
        userPresent: false,
        isMember: false,
        user: null,
      };
    }

    if (query.chatChannelType === ChatChannelType.DIRECT) {
      query.chatChannelId = getDirectChatChannelId(user.id, getUser().id);
    }

    const member = await this.chatChannelMemberRepo.findByChannelIdAndUserId({
      chatChannelId: query.chatChannelId,
      userId: user.id,
    });

    return {
      userPresent: true,
      isMember: !!member,
      user: user,
    };
  }
}
