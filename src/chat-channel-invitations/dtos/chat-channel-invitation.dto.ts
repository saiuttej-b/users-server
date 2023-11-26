import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { ChatChannelInvitationStatus } from 'src/domain/schemas/chat-channel-invitation.schema';
import { ChatChannelType } from 'src/domain/schemas/chat-channel.schema';

export class SendChatChannelInvitationDto {
  @IsIn(Object.values(ChatChannelType))
  @IsString()
  @IsNotEmpty()
  channelType: string;

  @ValidateIf((o) => o.channelType === ChatChannelType.GROUP)
  @IsString()
  chatChannelKey: string;

  @IsString({ each: true })
  @ArrayNotEmpty()
  @IsArray()
  @IsNotEmpty()
  userIds: string[];

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsOptional()
  message: string;
}

export class RespondToChatChannelInvitationDto {
  @IsString()
  @IsNotEmpty()
  invitationId: string;

  @IsIn([ChatChannelInvitationStatus.ACCEPTED, ChatChannelInvitationStatus.REJECTED])
  @IsString()
  @IsNotEmpty()
  response: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsOptional()
  message: string;
}

export class GetChatChannelInvitationsDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  createdById?: string;

  @IsIn(Object.values(ChatChannelType))
  @IsString()
  @IsOptional()
  channelType?: string;

  @IsString()
  @IsOptional()
  chatChannelKey?: string;

  @IsIn(Object.values(ChatChannelInvitationStatus), { each: true })
  @IsString({ each: true })
  @ArrayNotEmpty()
  @IsArray()
  @IsOptional()
  statuses?: string[];

  @Min(1)
  @IsNumber()
  @IsOptional()
  limit?: number;

  @Min(0)
  @IsNumber()
  @IsOptional()
  skip?: number;
}
