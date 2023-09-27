import { Injectable } from '@nestjs/common';
import { MediaResourceRepository } from 'src/domain/repositories/media-resource.repository';
import { MediaResourceManager } from '../managers/media-resource.manager';
import { UserPictureResource } from '../resources/user-picture.resource';

@Injectable()
export class MediaResourcesService {
  public readonly userProfilePicture: UserPictureResource;

  constructor(
    private readonly resourceManager: MediaResourceManager,
    private readonly mediaRepo: MediaResourceRepository,
  ) {
    this.userProfilePicture = new UserPictureResource(this.resourceManager, this.mediaRepo);
  }
}
