import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { uniq } from 'lodash';
import { Observable } from 'rxjs';
import { getUser } from 'src/utils/request-store/request-store';
import { PERMISSION_GUARD } from '../decorators/user-auth.decorators';

@Injectable()
export class UserAuthorizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const result = this.check(context);
    if (!result) throw new ForbiddenException('You do not have permission to perform this action');

    return result;
  }

  check(context: ExecutionContext) {
    const methodCheck = this.reflector.get(PERMISSION_GUARD, context.getHandler()) as string[];
    const classCheck = this.reflector.get(PERMISSION_GUARD, context.getClass()) as string[];

    const permissions = uniq([...(methodCheck || []), ...(classCheck || [])]);
    if (!permissions.length) return true;

    const user = getUser();
    if (!user) return false;

    if (user.isSuperUser) return true;

    const userPermissions = uniq(
      user.profiles.map((p) => p.permissions.map((pp) => pp.name)).flat(),
    );

    return permissions.every((p) => userPermissions.includes(p));
  }
}
