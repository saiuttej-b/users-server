import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { UserRepository } from 'src/domain/repositories/user.repository';
import { ENV } from 'src/utils/config.constants';
import { getUser, setUser } from 'src/utils/request-store/request-store';
import { compareHash } from 'src/utils/util-functions';
import { LoginUserDto } from '../dtos/user-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async loginUser(body: LoginUserDto) {
    const user = await this.userRepo.findUserIdByCredentials(body.loginId);
    if (!user) {
      throw new BadRequestException('There is no user with this login id');
    }

    const valid = await compareHash(body.password, user.password);
    if (!valid) {
      throw new BadRequestException('Wrong password');
    }

    return this.generateToken(user.id);
  }

  async getCurrentUser() {
    return getUser();
  }

  async setAccessTokenUser(accessToken: string) {
    const payload = this.getPayload(accessToken);
    if (!payload) return;

    const user = await this.userRepo.findById(payload.id);
    if (!user) return;

    if (user.passwordLastChangedAt) {
      const tokenIssuedAt = new Date(payload.iat * 1000);
      if (user.passwordLastChangedAt > tokenIssuedAt) return;
    }

    setUser(user);
  }

  private generateToken(id: string) {
    const payload = { id };

    const JWT_SECRET = this.configService.get<string>(ENV.JWT_SECRET);
    const JWT_EXPIRATION_TIME = this.configService.get<string>(ENV.JWT_EXPIRATION_TIME);

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION_TIME,
    });

    return { success: true, accessToken: token };
  }

  private getPayload(sessionToken: string) {
    const JWT_SECRET = this.configService.get<string>(ENV.JWT_SECRET);

    try {
      const payload = jwt.verify(sessionToken, JWT_SECRET);
      return {
        id: payload['id'],
        iat: payload['iat'],
      };
    } catch (err) {}
  }
}
