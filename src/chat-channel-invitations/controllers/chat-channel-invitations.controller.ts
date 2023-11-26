import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/decorators/user-auth.decorators';
import {
  GetChatChannelInvitationsDto,
  RespondToChatChannelInvitationDto,
  SendChatChannelInvitationDto,
} from '../dtos/chat-channel-invitation.dto';
import { ChatChannelInvitationsService } from '../services/chat-channel-invitations.service';

@JwtAuthGuard()
@Controller('chat-channel-invitations')
export class ChatChannelInvitationsController {
  constructor(private readonly service: ChatChannelInvitationsService) {}

  @Post('send')
  sendChatChannelInvitations(@Body() reqBody: SendChatChannelInvitationDto) {
    return this.service.sendChatChannelInvitations(reqBody);
  }

  @Post('respond')
  respondToChatChannelInvitation(@Body() reqBody: RespondToChatChannelInvitationDto) {
    return this.service.respondToChatChannelInvitation(reqBody);
  }

  @Get('my-invitations')
  getMyChatChannelInvitations(@Query() query: GetChatChannelInvitationsDto) {
    return this.service.getMyChatChannelInvitations(query);
  }
}
