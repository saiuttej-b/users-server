import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { getUser } from 'src/utils/request-store/request-store';
import { JWT_AUTH_GUARD } from '../decorators/user-auth.decorators';

@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const methodCheck = this.reflector.get(JWT_AUTH_GUARD, context.getHandler());
    const classCheck = this.reflector.get(JWT_AUTH_GUARD, context.getClass());
    if (!methodCheck && !classCheck) return true;

    const user = getUser();
    if (!user) throw new UnauthorizedException();
    if (!user.isActive) {
      throw new UnauthorizedException(
        'Your account is not active. Please contact the administrator.',
      );
    }

    return true;
  }
}
