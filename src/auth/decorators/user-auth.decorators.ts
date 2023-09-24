import { SetMetadata } from '@nestjs/common';

export const JWT_AUTH_GUARD = 'JWT_AUTH_GUARD';

export const JwtAuthGuard = () => SetMetadata(JWT_AUTH_GUARD, true);
