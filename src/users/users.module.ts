import { Module } from '@nestjs/common';
import { DomainModule } from 'src/domain/domain.module';
import { MediaResourcesModule } from 'src/media-resources/media-resources.module';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';

@Module({
  imports: [DomainModule, MediaResourcesModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
