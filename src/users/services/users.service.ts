import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'src/domain/repositories/user.repository';
import { MediaResourcesService } from 'src/media-resources/services/media-resources.service';
import { getUser } from 'src/utils/request-store/request-store';
import { UserProfilePictureUploadDto } from '../dtos/users-post.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly mediaResourceService: MediaResourcesService,
    private readonly userRepo: UserRepository,
  ) {}

  async uploadProfilePicture(file: Express.Multer.File, reqBody: UserProfilePictureUploadDto) {
    if (reqBody.userId && reqBody.userId !== getUser().id) {
      const user = await this.userRepo.findById(reqBody.userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
    }

    const picture = await this.mediaResourceService.userProfilePicture.uploadUserProfilePicture({
      file: file,
      typeId: reqBody.userId,
      createdById: getUser().id,
    });

    if (reqBody.userId) {
      await this.userRepo.updateProfilePicture({ id: reqBody.userId, picture });
    }

    return picture;
  }
}
