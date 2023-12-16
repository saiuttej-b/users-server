import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatChannelInvitationsModule } from './chat-channel-invitations/chat-channel-invitations.module';
import { ChatChannelMessagesModule } from './chat-channel-messages/chat-channel-messages.module';
import { ChatChannelsModule } from './chat-channels/chat-channels.module';
import { DomainModule } from './domain/domain.module';
import { MediaResourcesModule } from './media-resources/media-resources.module';
import { NotesModule } from './notes/notes.module';
import { PermissionProfilesModule } from './permission-profiles/permission-profiles.module';
import { SocketsModuleModule } from './sockets-module/sockets-module.module';
import { UsersModule } from './users/users.module';
import { ENV, Environments } from './utils/config.constants';
import { mongoConfig } from './utils/mongoose.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        [ENV.TZ]: Joi.string().default('UTC'),
        [ENV.PORT]: Joi.number().default(8000),
        [ENV.PROJECT_ENV]: Joi.string().default(Environments.DEVELOPMENT),

        [ENV.MONGO_DB_HOST]: Joi.string().required(),
        [ENV.MONGO_DB_USERNAME]: Joi.string().required(),
        [ENV.MONGO_DB_PASSWORD]: Joi.string().required(),
        [ENV.MONGO_DB_DATABASE]: Joi.string().required(),

        [ENV.AWS_S3_SECRET_ACCESS_KEY]: Joi.string().required(),
        [ENV.AWS_S3_ACCESS_KEY_ID]: Joi.string().required(),
        [ENV.AWS_S3_REGION]: Joi.string().required(),
        [ENV.AWS_S3_BUCKET_NAME]: Joi.string().required(),
        [ENV.AWS_S3_BUCKET_BASE_URL]: Joi.string().required(),

        [ENV.JWT_SECRET]: Joi.string().required(),
        [ENV.JWT_EXPIRATION_TIME]: Joi.string().required(),

        [ENV.ADMIN_EMAIL]: Joi.string().lowercase().trim().email().optional(),
      }).unknown(true),
    }),
    MongooseModule.forRoot(mongoConfig().MONGO_URI, {
      autoIndex: false,
    }),
    DomainModule,
    MediaResourcesModule,
    AuthModule,
    PermissionProfilesModule,
    UsersModule,
    NotesModule,
    ChatChannelInvitationsModule,
    ChatChannelsModule,
    ChatChannelMessagesModule,
    SocketsModuleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
