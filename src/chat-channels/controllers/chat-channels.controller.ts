import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/decorators/user-auth.decorators';
import {
  GroupChatChannelPostDto,
  UpdateChatChannelMemberRoleDto,
} from '../dtos/chat-channel-post.dto';
import { ChatChannelsService } from '../services/chat-channels.service';

@JwtAuthGuard()
@Controller('chat-channels')
export class ChatChannelsController {
  constructor(private readonly service: ChatChannelsService) {}

  @Post('group-channel')
  createGroupChatChannel(@Body() reqBody: GroupChatChannelPostDto) {
    return this.service.createGroupChatChannel(reqBody);
  }

  @Put('group-channel/:id/details')
  updateGroupChatChannelDetails(@Body() reqBody: GroupChatChannelPostDto, @Param('id') id: string) {
    return this.service.updateChatChannelDetails(reqBody, id);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Put('group-channel/:id/avatar')
  updateGroupChatChannelAvatar(@UploadedFile() file: Express.Multer.File, @Param('id') id: string) {
    return this.service.updateChatChannelAvatar(file, id);
  }

  @Put('group-channel/:id/member-role')
  updateChatChannelMemberRole(
    @Body() reqBody: UpdateChatChannelMemberRoleDto,
    @Param('id') id: string,
  ) {
    return this.service.updateChatChannelMemberRole(reqBody, id);
  }

  @Get('my-chat-channels')
  getMyChatChannels() {
    return this.service.getMyChatChannels();
  }
}
