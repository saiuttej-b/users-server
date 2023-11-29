import { Module } from '@nestjs/common';
import { DomainModule } from 'src/domain/domain.module';
import { MediaResourcesModule } from 'src/media-resources/media-resources.module';
import { ChatChannelsController } from './controllers/chat-channels.controller';
import { ChatChannelsService } from './services/chat-channels.service';

@Module({
  imports: [DomainModule, MediaResourcesModule],
  providers: [ChatChannelsService],
  controllers: [ChatChannelsController],
  exports: [ChatChannelsService],
})
export class ChatChannelsModule {}
