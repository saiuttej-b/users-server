import { Module, Provider } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoDBMediaResourceRepository } from './mongodb-repositories/mongodb-media-resource.repository';
import { MongoDBUserRegistrationRequestRepository } from './mongodb-repositories/mongodb-user-registration-request.repository';
import { MongoDBUserRepository } from './mongodb-repositories/mongodb-user.repository';
import { MediaResourceRepository } from './repositories/media-resource.repository';
import { UserRegistrationRequestRepository } from './repositories/user-registration-request.repository';
import { UserRepository } from './repositories/user.repository';
import { MediaResource, MediaResourceSchema } from './schemas/media-resource.schema';
import {
  UserRegistrationRequest,
  UserRegistrationRequestSchema,
} from './schemas/user-registration-requests.schema';
import { User, UserSchema } from './schemas/user.schema';

const repos: Provider[] = [
  {
    provide: MediaResourceRepository,
    useClass: MongoDBMediaResourceRepository,
  },
  {
    provide: UserRepository,
    useClass: MongoDBUserRepository,
  },
  {
    provide: UserRegistrationRequestRepository,
    useClass: MongoDBUserRegistrationRequestRepository,
  },
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MediaResource.name, schema: MediaResourceSchema },
      { name: User.name, schema: UserSchema },
      { name: UserRegistrationRequest.name, schema: UserRegistrationRequestSchema },
    ]),
  ],
  providers: [...repos],
  exports: [...repos],
})
export class DomainModule {}
