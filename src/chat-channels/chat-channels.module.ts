import { Module } from '@nestjs/common';
import { DomainModule } from 'src/domain/domain.module';
import { ChatChannelsService } from './services/chat-channels.service';

@Module({
  imports: [DomainModule],
  providers: [ChatChannelsService],
  exports: [ChatChannelsService],
})
export class ChatChannelsModule {}
