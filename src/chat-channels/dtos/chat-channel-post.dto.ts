import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ChatChannelMemberRole } from 'src/domain/schemas/chat-channel-member.schema';

export class GroupChatChannelPostDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  name: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsOptional()
  description: string;
}

export class UpdateChatChannelMemberRoleDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsIn(Object.values(ChatChannelMemberRole))
  @IsString()
  @IsNotEmpty()
  role: string;
}
