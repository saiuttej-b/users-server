import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class PermissionPostDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim()?.toUpperCase())
  name: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  actions: string[];
}

export class PermissionProfilePostDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim()?.toUpperCase())
  name: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsNotEmpty()
  @IsArray()
  @Type(() => PermissionPostDto)
  @ValidateNested({ each: true })
  permissions: PermissionPostDto[];
}

export class PermissionProfileGetDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  @IsIn(['true', 'false'])
  isSearch?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;
}
