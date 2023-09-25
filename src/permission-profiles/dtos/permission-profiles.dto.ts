import { Transform, Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

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
