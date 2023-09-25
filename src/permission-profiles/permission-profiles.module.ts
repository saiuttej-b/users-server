import { Module } from '@nestjs/common';
import { DomainModule } from 'src/domain/domain.module';
import { PermissionProfilesController } from './controllers/permission-profiles.controller';
import { PermissionProfilesService } from './services/permission-profiles.service';

@Module({
  imports: [DomainModule],
  controllers: [PermissionProfilesController],
  providers: [PermissionProfilesService],
})
export class PermissionProfilesModule {}
