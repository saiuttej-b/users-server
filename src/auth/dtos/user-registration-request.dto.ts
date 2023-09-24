import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class OtpVerifyDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsNumberString()
  otp: string;
}

export class ResendOtpDto {
  @IsNotEmpty()
  @IsString()
  token: string;
}
