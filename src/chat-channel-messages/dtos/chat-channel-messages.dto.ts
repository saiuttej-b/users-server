import { Transform } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChatChannelMessageCreateDto {
  @IsString()
  @IsNotEmpty()
  chatChannelId: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsOptional()
  message?: string;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  resourceKeys?: string[];
}

export class ChatChannelMessageUpdateDto {
  @IsString()
  @IsNotEmpty()
  chatChannelMessageId: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsOptional()
  message?: string;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  resourceKeys?: string[];
}
