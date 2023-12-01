import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ChatChannelMemberRepository } from 'src/domain/repositories/chat-channel-member.repository';
import { ChatChannelMessageRepository } from 'src/domain/repositories/chat-channel-message.repository';
import { ChatChannelRepository } from 'src/domain/repositories/chat-channel.repository';
import { ChatChannelMemberRole } from 'src/domain/schemas/chat-channel-member.schema';
import { MediaResourcesService } from 'src/media-resources/services/media-resources.service';
import { getUser } from 'src/utils/request-store/request-store';
import {
  ChatChannelMessageUpdateDto,
  GetChatChannelMessagesDto,
  SendChatChannelMessageDto,
} from '../dtos/chat-channel-messages.dto';

@Injectable()
export class ChatChannelMessagesService {
  constructor(
    private readonly chatChannelRepo: ChatChannelRepository,
    private readonly chatChannelMemberRepo: ChatChannelMemberRepository,
    private readonly chatChannelMessageRepo: ChatChannelMessageRepository,
    private readonly mediaResourcesService: MediaResourcesService,
  ) {}

  async uploadResource(file: Express.Multer.File) {
    return this.mediaResourcesService.chatChannelMessage.upload({
      file: file,
      createdById: getUser().id,
    });
  }

  private checkMessageBody(reqBody: { message?: string; resourceKeys?: string[] }) {
    if (!reqBody.message && !reqBody.resourceKeys?.length) {
      throw new BadRequestException('Message or Resources must be provided');
    }
  }

  async sendChatChannelMessage(reqBody: SendChatChannelMessageDto) {
    this.checkMessageBody(reqBody);

    const channel = await this.chatChannelRepo.findById({ id: reqBody.chatChannelId });
    if (!channel) {
      throw new NotFoundException('Chat channel not found');
    }

    const member = await this.chatChannelMemberRepo.findByChannelIdAndUserId({
      chatChannelId: reqBody.chatChannelId,
      userId: getUser().id,
    });
    if (!member) {
      throw new BadRequestException('You are not a member of this chat channel');
    }
    if (member.role === ChatChannelMemberRole.VIEWER) {
      throw new BadRequestException(
        'You do not have permission to send message to this chat channel',
      );
    }

    const message = this.chatChannelMessageRepo.instance();
    message.chatChannelId = reqBody.chatChannelId;
    message.createdById = getUser().id;
    message.message = reqBody.message;

    message.resources = await this.mediaResourcesService.chatChannelMessage.updateResourceFiles({
      keys: reqBody.resourceKeys ?? [],
      typeId: message.id,
    });

    return await this.chatChannelMessageRepo.create(message);
  }

  async updateChatChannelMessage(reqBody: ChatChannelMessageUpdateDto) {
    this.checkMessageBody(reqBody);

    const message = await this.chatChannelMessageRepo.findById(reqBody.chatChannelMessageId);
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    if (message.createdById !== getUser().id) {
      throw new BadRequestException('You do not have permission to update this message');
    }

    const member = await this.chatChannelMemberRepo.findByChannelIdAndUserId({
      chatChannelId: message.chatChannelId,
      userId: getUser().id,
    });
    if (!member) {
      throw new BadRequestException('You are not a member of this chat channel');
    }
    if (member.role === ChatChannelMemberRole.VIEWER) {
      throw new BadRequestException(
        'You do not have permission to send message to this chat channel',
      );
    }

    message.message = reqBody.message;
    message.resources = await this.mediaResourcesService.chatChannelMessage.updateResourceFiles({
      keys: reqBody.resourceKeys ?? [],
      typeId: message.id,
    });

    return await this.chatChannelMessageRepo.save(message);
  }

  async deleteChatChannelMessage(id: string) {
    const message = await this.chatChannelMessageRepo.findById(id);
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    const member = await this.chatChannelMemberRepo.findByChannelIdAndUserId({
      chatChannelId: message.chatChannelId,
      userId: getUser().id,
    });
    if (!member) {
      throw new BadRequestException('You are not a member of this chat channel');
    }
    if (member.role === ChatChannelMemberRole.VIEWER) {
      throw new BadRequestException(
        'You do not have permission to send message to this chat channel',
      );
    }

    if (message.createdById !== getUser().id && member.role === ChatChannelMemberRole.MEMBER) {
      throw new BadRequestException('You do not have permission to delete this message');
    }

    await this.chatChannelMessageRepo.deleteById(id);
    await this.mediaResourcesService.chatChannelMessage.deleteByTypeId(message.id);

    return {
      success: true,
      message: 'Message deleted successfully',
    };
  }

  async getChatChannelMessages(query: GetChatChannelMessagesDto) {
    // Check if user is a member of the chat channel
    const member = await this.chatChannelMemberRepo.findByChannelIdAndUserId({
      chatChannelId: query.chatChannelId,
      userId: getUser().id,
    });
    if (!member) {
      throw new BadRequestException('You are not a member of this chat channel');
    }

    return this.chatChannelMessageRepo.chatChannelMessages(query);
  }
}
