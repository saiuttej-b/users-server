import { Transform } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsStrongPassword,
  Min,
} from 'class-validator';

export class UserProfilePictureUploadDto {
  @IsOptional()
  @IsString()
  userId?: string;
}

export class UserUpdateDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  username: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  lastName?: string;

  @IsOptional()
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minSymbols: 1,
    minNumbers: 1,
  })
  password: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  profileIds: string[];
}

export class UsersGetDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;
}
