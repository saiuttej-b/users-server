import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DomainModule } from 'src/domain/domain.module';
import { AuthRequestsController } from './controllers/auth-requests.controller';
import { AuthController } from './controllers/auth.controller';
import { UserAuthGuard } from './guards/user-auth.guard';
import { UserAuthorizationGuard } from './guards/user-authorization.guard';
import { UserAuthMiddleware } from './middleware/user-auth.middleware';
import { AuthRegistrationRequestsService } from './services/auth-registration-requests.service';
import { AuthService } from './services/auth.service';

@Module({
  imports: [DomainModule],
  controllers: [AuthController, AuthRequestsController],
  providers: [
    AuthService,
    AuthRegistrationRequestsService,
    {
      provide: APP_GUARD,
      useClass: UserAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: UserAuthorizationGuard,
    },
  ],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserAuthMiddleware).exclude('/auth/login', '/auth-requests/*').forRoutes('*');
  }
}
