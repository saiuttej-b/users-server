import { IsOptional, IsString } from 'class-validator';

export class UserProfilePictureUploadDto {
  @IsOptional()
  @IsString()
  userId?: string;
}
