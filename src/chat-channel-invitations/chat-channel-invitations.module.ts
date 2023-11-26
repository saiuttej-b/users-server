import { Module } from '@nestjs/common';
import { ChatChannelsModule } from 'src/chat-channels/chat-channels.module';
import { DomainModule } from 'src/domain/domain.module';
import { ChatChannelInvitationsController } from './controllers/chat-channel-invitations.controller';
import { ChatChannelInvitationsService } from './services/chat-channel-invitations.service';

@Module({
  imports: [DomainModule, ChatChannelsModule],
  controllers: [ChatChannelInvitationsController],
  providers: [ChatChannelInvitationsService],
})
export class ChatChannelInvitationsModule {}
