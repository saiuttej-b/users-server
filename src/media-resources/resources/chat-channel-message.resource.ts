import { BadRequestException } from '@nestjs/common';
import { uniq } from 'lodash';
import { MediaResourceRepository } from 'src/domain/repositories/media-resource.repository';
import { MediaResource } from 'src/domain/schemas/media-resource.schema';
import { generateFileName } from 'src/utils/util-functions';
import { MediaResourceManager } from '../managers/media-resource.manager';

const type = 'chat-channels';
const subtype = 'messages';

export class ChatChannelMessageResource {
  constructor(
    private readonly manager: MediaResourceManager,
    private readonly mediaResourceRepo: MediaResourceRepository,
  ) {}

  async upload(props: { file: Express.Multer.File; typeId?: string; createdById?: string }) {
    if (!props.file) {
      throw new BadRequestException('File is required');
    }

    const keySuffix = generateFileName(props.file.originalname);

    return await this.manager.uploadFile({
      file: props.file,
      type: type,
      subtype: subtype,
      key: `${type}/${subtype}/${keySuffix}`,
      typeId: props.typeId,
      createdById: props.createdById,
    });
  }

  async deleteByTypeId(typeId: string) {
    const resources = await this.mediaResourceRepo.findToBeDeleted({
      type: type,
      subtypes: [subtype],
      typeIds: [typeId],
    });

    await this.manager.deleteFiles(resources);
  }

  async updateResourceFiles(props: { keys: string[]; typeId: string }) {
    const resources = await this.validateResourceFiles(props);
    return this.updateResourceFilesTypeId({ resources, typeId: props.typeId });
  }

  async validateResourceFiles(props: { keys: string[]; typeId: string }) {
    if (!props.keys.length) return [];

    const keys = uniq(props.keys);
    if (props.keys.length !== keys.length) {
      throw new BadRequestException('Duplicate file uploads found');
    }

    const resources = await this.mediaResourceRepo.findByKeys({
      type: type,
      subtype: subtype,
      keys: props.keys,
    });
    if (resources.length !== props.keys.length) {
      throw new BadRequestException('Unable to find all uploaded files');
    }
    if (resources.some((x) => x.typeId && x.typeId !== props.typeId)) {
      throw new BadRequestException('Some uploaded files are already used');
    }

    return resources;
  }

  async updateResourceFilesTypeId(props: { resources: MediaResource[]; typeId: string }) {
    const resources = props.resources;

    const keys = resources.filter((r) => r.typeId !== props.typeId).map((r) => r.key);
    await this.mediaResourceRepo.updateTypeId(keys, props.typeId);

    const others = await this.mediaResourceRepo.findByTypeIdAndNotKeys({
      type: type,
      subtype: subtype,
      typeId: props.typeId,
      keys: resources.map((r) => r.key),
    });
    await this.manager.deleteFiles(others.map((x) => x.key));

    resources.forEach((r) => {
      r.typeId = props.typeId;
    });

    return resources;
  }
}
