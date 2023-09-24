import { IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty()
  @IsString()
  loginId: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
