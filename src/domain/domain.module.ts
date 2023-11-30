import { Module, Provider } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoDBChatChannelInvitationRepository } from './mongodb-repositories/mongodb-chat-channel-invitation.repository';
import { MongoDBChatChannelMemberRepository } from './mongodb-repositories/mongodb-chat-channel-member.repository';
import { MongoDBChatChannelMessageRepository } from './mongodb-repositories/mongodb-chat-channel-message.repository';
import { MongoDBChatChannelRepository } from './mongodb-repositories/mongodb-chat-channel.repository';
import { MongoDBMediaResourceRepository } from './mongodb-repositories/mongodb-media-resource.repository';
import { MongoDBNotesRepository } from './mongodb-repositories/mongodb-notes.repository';
import { MongoDBPermissionProfileRepository } from './mongodb-repositories/mongodb-permission-profile.repository';
import { MongoDBUserRegistrationRequestRepository } from './mongodb-repositories/mongodb-user-registration-request.repository';
import { MongoDBUserRepository } from './mongodb-repositories/mongodb-user.repository';
import { ChatChannelInvitationRepository } from './repositories/chat-channel-invitation.repository';
import { ChatChannelMemberRepository } from './repositories/chat-channel-member.repository';
import { ChatChannelMessageRepository } from './repositories/chat-channel-message.repository';
import { ChatChannelRepository } from './repositories/chat-channel.repository';
import { MediaResourceRepository } from './repositories/media-resource.repository';
import { NotesRepository } from './repositories/notes.repository';
import { PermissionProfileRepository } from './repositories/permission-profile.repository';
import { UserRegistrationRequestRepository } from './repositories/user-registration-request.repository';
import { UserRepository } from './repositories/user.repository';
import {
  ChatChannelInvitation,
  ChatChannelInvitationSchema,
} from './schemas/chat-channel-invitation.schema';
import { ChatChannelMember, ChatChannelMemberSchema } from './schemas/chat-channel-member.schema';
import {
  ChatChannelMessage,
  ChatChannelMessageSchema,
} from './schemas/chat-channel-message.schema';
import { ChatChannel, ChatChannelSchema } from './schemas/chat-channel.schema';
import { MediaResource, MediaResourceSchema } from './schemas/media-resource.schema';
import { Notes, NotesSchema } from './schemas/notes.schema';
import { PermissionProfile, PermissionProfileSchema } from './schemas/permission-profile.schema';
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
  {
    provide: PermissionProfileRepository,
    useClass: MongoDBPermissionProfileRepository,
  },

  {
    provide: NotesRepository,
    useClass: MongoDBNotesRepository,
  },

  {
    provide: ChatChannelRepository,
    useClass: MongoDBChatChannelRepository,
  },
  {
    provide: ChatChannelMemberRepository,
    useClass: MongoDBChatChannelMemberRepository,
  },
  {
    provide: ChatChannelInvitationRepository,
    useClass: MongoDBChatChannelInvitationRepository,
  },
  {
    provide: ChatChannelMessageRepository,
    useClass: MongoDBChatChannelMessageRepository,
  },
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MediaResource.name, schema: MediaResourceSchema },
      { name: UserRegistrationRequest.name, schema: UserRegistrationRequestSchema },
      { name: User.name, schema: UserSchema },
      { name: PermissionProfile.name, schema: PermissionProfileSchema },

      { name: Notes.name, schema: NotesSchema },

      { name: ChatChannel.name, schema: ChatChannelSchema },
      { name: ChatChannelMember.name, schema: ChatChannelMemberSchema },
      { name: ChatChannelInvitation.name, schema: ChatChannelInvitationSchema },
      { name: ChatChannelMessage.name, schema: ChatChannelMessageSchema },
    ]),
  ],
  providers: [...repos],
  exports: [...repos],
})
export class DomainModule {}
