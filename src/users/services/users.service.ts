import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { uniq } from 'lodash';
import { PermissionProfileRepository } from 'src/domain/repositories/permission-profile.repository';
import { UserRepository } from 'src/domain/repositories/user.repository';
import { MediaResourcesService } from 'src/media-resources/services/media-resources.service';
import { getUser } from 'src/utils/request-store/request-store';
import { hashValue, validateUsername } from 'src/utils/util-functions';
import { UserProfilePictureUploadDto, UserUpdateDto, UsersGetDto } from '../dtos/users.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly mediaResourceService: MediaResourcesService,
    private readonly userRepo: UserRepository,
    private readonly profileRepo: PermissionProfileRepository,
  ) {}

  async uploadProfilePicture(file: Express.Multer.File, reqBody: UserProfilePictureUploadDto) {
    if (reqBody.userId && reqBody.userId !== getUser().id) {
      const user = await this.userRepo.findById(reqBody.userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
    }

    if (!reqBody.userId) reqBody.userId = getUser().id;

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

  async updateUser(id: string, reqBody: UserUpdateDto) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    reqBody.profileIds = uniq(reqBody.profileIds);
    validateUsername(reqBody.username, true);
    const username = await this.userRepo.findByUsername(reqBody.username, id);
    if (username) {
      throw new BadRequestException('There is already a user with this username');
    }

    const profiles = await this.profileRepo.findByIds(reqBody.profileIds);
    if (profiles.length !== reqBody.profileIds.length) {
      throw new NotFoundException('One or more profiles not found');
    }

    user.username = reqBody.username;
    user.firstName = reqBody.firstName;
    user.lastName = reqBody.lastName;
    user.profiles = profiles;

    if (reqBody.password) {
      user.password = await hashValue(reqBody.password);
      user.passwordLastChangedAt = new Date();
    }

    return this.userRepo.save(user);
  }

  async findUsers(query: UsersGetDto) {
    return this.userRepo.find(query);
  }

  async findUserById(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
