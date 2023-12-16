import { Body, Controller, Get, Post } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/decorators/user-auth.decorators';
import { LoginUserDto } from '../dtos/user-auth.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('login')
  loginUser(@Body() body: LoginUserDto) {
    return this.service.loginUser(body);
  }

  @Post('create-super-user')
  createSuperUser() {
    return this.service.createSuperUser();
  }

  @JwtAuthGuard()
  @Get('current-user')
  getCurrentUser() {
    return this.service.getCurrentUser();
  }
}
