import { Module } from '@nestjs/common';
import { DomainModule } from 'src/domain/domain.module';
import { MediaResourcesModule } from 'src/media-resources/media-resources.module';
import { ChatChannelMessagesController } from './controllers/chat-channel-messages.controller';
import { ChatChannelMessagesService } from './services/chat-channel-messages.service';

@Module({
  imports: [DomainModule, MediaResourcesModule],
  controllers: [ChatChannelMessagesController],
  providers: [ChatChannelMessagesService],
})
export class ChatChannelMessagesModule {}
