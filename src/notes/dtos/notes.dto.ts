import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class NotesPostDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  title: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  content?: string;
}
