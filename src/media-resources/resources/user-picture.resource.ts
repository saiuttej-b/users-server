import { BadRequestException } from '@nestjs/common';
import { MediaResourceRepository } from 'src/domain/repositories/media-resource.repository';
import { generateFileName } from 'src/utils/util-functions';
import { MediaResourceManager } from '../managers/media-resource.manager';

const type = 'users';
const subtype = 'profile-pictures';

export class UserPictureResource {
  constructor(
    private readonly manager: MediaResourceManager,
    private readonly mediaResourceRepo: MediaResourceRepository,
  ) {}

  async uploadUserProfilePicture(props: {
    file: Express.Multer.File;
    typeId: string;
    createdById?: string;
  }) {
    if (!props.file) {
      throw new BadRequestException('File is required');
    }

    const keySuffix = generateFileName(props.file.originalname);

    const media = await this.manager.uploadFile({
      file: props.file,
      type: type,
      subtype: subtype,
      key: `${type}/${subtype}/${keySuffix}`,
      typeId: props.typeId,
      createdById: props.createdById,
    });

    if (props.typeId) {
      await this.deleteByTypeId({ typeId: props.typeId, notKeys: [media.key] });
    }

    return media;
  }

  async updateTypeId(key: string, typeId: string) {
    const media = await this.mediaResourceRepo.findOne({
      type: type,
      subtype: subtype,
      key: key,
    });
    if (!media) {
      throw new BadRequestException('Media not found');
    }
    if (media.typeId && media.typeId === typeId) return media;
    if (media.typeId && media.typeId !== typeId) {
      throw new BadRequestException('Media is already associated with another user');
    }

    media.typeId = typeId;
    await this.mediaResourceRepo.updateTypeId([media.key], typeId);
    await this.deleteByTypeId({ typeId: typeId, notKeys: [media.key] });

    return media;
  }

  async deleteByTypeId(props: { typeId: string; notKeys?: string[] }) {
    const media = await this.mediaResourceRepo.findByTypeIdAndNotKeys({
      type: type,
      subtype: subtype,
      typeId: props.typeId,
      keys: props.notKeys || [],
    });

    await this.manager.deleteFiles(media.map((m) => m.key));
  }
}
