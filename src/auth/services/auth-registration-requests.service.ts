import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { random } from 'lodash';
import { UserRegistrationRequestRepository } from 'src/domain/repositories/user-registration-request.repository';
import { UserRepository } from 'src/domain/repositories/user.repository';
import { RegistrationRequestDto } from 'src/domain/schemas/user-registration-requests.schema';
import { hashValue, validateUsername } from 'src/utils/util-functions';
import { OtpVerifyDto, ResendOtpDto } from '../dtos/user-registration-request.dto';

@Injectable()
export class AuthRegistrationRequestsService {
  private readonly logger = new Logger(AuthRegistrationRequestsService.name);

  constructor(
    private readonly userRepo: UserRepository,
    private readonly authRequestRepo: UserRegistrationRequestRepository,
  ) {}

  async createRegistrationRequest(body: RegistrationRequestDto) {
    const email = await this.userRepo.findByEmail(body.email);
    if (email) {
      throw new BadRequestException(`There is already a user with this email: ${body.email}`);
    }

    validateUsername(body.username, true);

    const username = await this.userRepo.findByUsername(body.username);
    if (username) {
      throw new BadRequestException(`There is already a user with this username: ${body.username}`);
    }

    body.password = await hashValue(body.password);

    const regRequest = this.authRequestRepo.instance();
    regRequest.email = body.email;
    regRequest.meta = body;
    regRequest.emailOtp = random(100000, 999999).toString();
    regRequest.emailOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.authRequestRepo.deleteByEmailId(regRequest.email);
    await this.authRequestRepo.create(regRequest);

    await this.sendEmailOtp({
      email: regRequest.email,
      otp: regRequest.emailOtp,
      expiresAt: regRequest.emailOtpExpiresAt,
    });

    return {
      success: true,
      message: 'User registered successfully',
      token: regRequest.id,
      email: regRequest.email,
    };
  }

  async resendEmailOtp(body: ResendOtpDto) {
    const regRequest = await this.authRequestRepo.findById(body.token);
    if (!regRequest) {
      throw new NotFoundException('Unable to find your registration request');
    }
    if (regRequest.emailOtpVerified) {
      throw new BadRequestException('Your email otp is already verified');
    }

    regRequest.emailOtp = random(100000, 999999).toString();
    regRequest.emailOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await this.authRequestRepo.save(regRequest);

    await this.sendEmailOtp({
      email: regRequest.email,
      otp: regRequest.emailOtp,
      expiresAt: regRequest.emailOtpExpiresAt,
    });

    return {
      success: true,
      message: 'Email otp sent successfully',
      token: regRequest.id,
      email: regRequest.email,
    };
  }

  async verifyEmailOtp(body: OtpVerifyDto) {
    const regRequest = await this.authRequestRepo.findById(body.token);
    if (!regRequest) {
      throw new NotFoundException('Unable to find your registration request');
    }
    if (regRequest.emailOtpVerified) {
      throw new BadRequestException('Your email otp is already verified');
    }
    if (regRequest.used) {
      throw new BadRequestException('Your registration request is already used');
    }
    if (regRequest.emailOtpExpiresAt < new Date()) {
      throw new BadRequestException('Your email otp is expired');
    }
    if (regRequest.emailOtp !== body.otp) {
      throw new BadRequestException('Invalid otp');
    }

    regRequest.emailOtpVerified = true;
    regRequest.used = true;
    await this.authRequestRepo.save(regRequest);

    await this.registerUser(regRequest.meta);

    return {
      success: true,
      message: 'Email otp verified successfully, user registered successfully',
    };
  }

  private async registerUser(body: RegistrationRequestDto) {
    const email = await this.userRepo.findByEmail(body.email);
    if (email) {
      throw new BadRequestException(`There is already a user with this email ${body.email}`);
    }

    const username = await this.userRepo.findByUsername(body.username);
    if (username) {
      throw new BadRequestException(`There is already a user with this username ${body.username}`);
    }

    const user = this.userRepo.instance(body);
    await this.userRepo.create(user);

    return {
      success: true,
      message: 'User registered successfully',
    };
  }

  private async sendEmailOtp(props: { email: string; otp: string; expiresAt: Date }) {
    // TODO: Send email otp
    this.logger.debug(props);
  }
}
