import { Module } from '@nestjs/common';
import { DomainModule } from 'src/domain/domain.module';
import { AwsResourceManager } from './managers/aws-resource.manager';
import { MediaResourceManager } from './managers/media-resource.manager';
import { MediaResourcesService } from './services/media-resources.service';

@Module({
  imports: [DomainModule],
  providers: [
    {
      provide: MediaResourceManager,
      useClass: AwsResourceManager,
    },
    MediaResourcesService,
  ],
  exports: [MediaResourcesService],
})
export class MediaResourcesModule {}
