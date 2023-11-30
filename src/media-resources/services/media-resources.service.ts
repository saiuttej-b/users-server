import { Injectable } from '@nestjs/common';
import { MediaResourceRepository } from 'src/domain/repositories/media-resource.repository';
import { MediaResourceManager } from '../managers/media-resource.manager';
import { ChatChannelAvatarResource } from '../resources/chat-channel-avtar.resource';
import { ChatChannelMessageResource } from '../resources/chat-channel-message.resource';
import { UserPictureResource } from '../resources/user-picture.resource';

@Injectable()
export class MediaResourcesService {
  public readonly userProfilePicture: UserPictureResource;

  public readonly chatChannelAvatar: ChatChannelAvatarResource;
  public readonly chatChannelMessage: ChatChannelMessageResource;

  constructor(
    private readonly resourceManager: MediaResourceManager,
    private readonly mediaRepo: MediaResourceRepository,
  ) {
    this.userProfilePicture = new UserPictureResource(this.resourceManager, this.mediaRepo);

    this.chatChannelAvatar = new ChatChannelAvatarResource(this.resourceManager, this.mediaRepo);
    this.chatChannelMessage = new ChatChannelMessageResource(this.resourceManager, this.mediaRepo);
  }
}
