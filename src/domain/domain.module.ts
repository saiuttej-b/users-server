import { Module, Provider } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoDBMediaResourceRepository } from './mongodb-repositories/mongodb-media-resource.repository';
import { MediaResourceRepository } from './repositories/media-resource.repository';
import {
  MediaResource,
  MediaResourceSchema,
} from './schemas/media-resource.schema';

const repos: Provider[] = [
  {
    provide: MediaResourceRepository,
    useClass: MongoDBMediaResourceRepository,
  },
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MediaResource.name, schema: MediaResourceSchema },
    ]),
  ],
  providers: [...repos],
  exports: [...repos],
})
export class DomainModule {}
