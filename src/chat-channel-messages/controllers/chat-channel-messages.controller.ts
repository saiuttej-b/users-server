import { Body, Controller, Delete, Param, Post, UploadedFile } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/decorators/user-auth.decorators';
import {
  ChatChannelMessageUpdateDto,
  SendChatChannelMessageDto,
} from '../dtos/chat-channel-messages.dto';
import { ChatChannelMessagesService } from '../services/chat-channel-messages.service';

@JwtAuthGuard()
@Controller('chat-channel-messages')
export class ChatChannelMessagesController {
  constructor(private readonly service: ChatChannelMessagesService) {}

  @Post('send-message')
  sendChatChannelMessage(@Body() reqBody: SendChatChannelMessageDto) {
    return this.service.sendChatChannelMessage(reqBody);
  }

  @Post('update-message')
  updateChatChannelMessage(@Body() reqBody: ChatChannelMessageUpdateDto) {
    return this.service.updateChatChannelMessage(reqBody);
  }

  @Post('upload-resource')
  uploadResource(@UploadedFile() file: Express.Multer.File) {
    return this.service.uploadResource(file);
  }

  @Delete(':id')
  deleteChatChannelMessage(@Param('id') id: string) {
    return this.service.deleteChatChannelMessage(id);
  }
}
