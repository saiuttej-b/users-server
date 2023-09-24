import { Body, Controller, Post } from '@nestjs/common';
import { RegistrationRequestDto } from 'src/domain/schemas/user-registration-requests.schema';
import { OtpVerifyDto, ResendOtpDto } from '../dtos/user-registration-request.dto';
import { AuthRegistrationRequestsService } from '../services/auth-registration-requests.service';

@Controller('auth-requests')
export class AuthRequestsController {
  constructor(private readonly registerRepo: AuthRegistrationRequestsService) {}

  @Post('register')
  createRegistrationRequest(@Body() body: RegistrationRequestDto) {
    return this.registerRepo.createRegistrationRequest(body);
  }

  @Post('resend-email-otp')
  resendEmailOtp(@Body() body: ResendOtpDto) {
    return this.registerRepo.resendEmailOtp(body);
  }

  @Post('verify-email-otp')
  verifyEmailOtp(@Body() body: OtpVerifyDto) {
    return this.registerRepo.verifyEmailOtp(body);
  }
}
