import { BadRequestException } from '@nestjs/common';
import { MediaResourceRepository } from 'src/domain/repositories/media-resource.repository';
import { generateFileName } from 'src/utils/util-functions';
import { MediaResourceManager } from '../managers/media-resource.manager';

const type = 'chat-channels';
const subtype = 'avatars';

export class ChatChannelAvatarResource {
  constructor(
    private readonly manager: MediaResourceManager,
    private readonly mediaResourceRepo: MediaResourceRepository,
  ) {}

  async upload(props: { file: Express.Multer.File; typeId: string; createdById?: string }) {
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

    await this.deleteByTypeId({ typeId: props.typeId, notKeys: [media.key] });

    return media;
  }

  private async deleteByTypeId(props: { typeId: string; notKeys?: string[] }) {
    const media = await this.mediaResourceRepo.findByTypeIdAndNotKeys({
      type: type,
      subtype: subtype,
      typeId: props.typeId,
      keys: props.notKeys || [],
    });

    await this.manager.deleteFiles(media.map((m) => m.key));
  }
}
