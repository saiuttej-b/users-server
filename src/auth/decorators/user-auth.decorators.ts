import { SetMetadata } from '@nestjs/common';

export const JWT_AUTH_GUARD = 'JWT_AUTH_GUARD';
export const JwtAuthGuard = () => SetMetadata(JWT_AUTH_GUARD, true);

export const PERMISSION_GUARD = 'PERMISSION_GUARD';
export const CheckPermission = (...permissions: string[]) => {
  return SetMetadata(PERMISSION_GUARD, permissions);
};
