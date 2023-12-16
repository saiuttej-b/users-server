import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MediaResource, MediaResourceDocument } from 'src/domain/schemas/media-resource.schema';
import { generateId } from 'src/utils/util-functions';
import { MediaResourceRepository } from '../repositories/media-resource.repository';

@Injectable()
export class MongoDBMediaResourceRepository implements MediaResourceRepository {
  constructor(@InjectModel(MediaResource.name) private readonly mediaModel: Model<MediaResource>) {}

  instance(data?: Partial<MediaResource>): MediaResource {
    const media = new MediaResource();
    if (data) Object.assign(media, data);
    if (!media.id) media.id = generateId();

    return media;
  }

  async create(media: MediaResource): Promise<MediaResource> {
    if (!media.id) media.id = generateId();

    const mediaDoc = new this.mediaModel(media);
    const record = await mediaDoc.save();
    return this.convert(record);
  }

  async save(media: MediaResource): Promise<MediaResource> {
    if (!media.id) return this.create(media);

    const previous = await this.mediaModel.findOne({ id: media.id }).exec();
    if (!previous) return this.create(media);

    Object.assign(previous, media);
    if (!previous.isNew && !previous.isModified()) return this.convert(previous);

    const record = await previous.save();
    return this.convert(record);
  }

  async updateTypeId(keys: string[], typeId: string): Promise<void> {
    if (!keys.length) return;

    await this.mediaModel.updateMany({ key: { $in: keys } }, { typeId }).exec();
  }

  async deleteByKeys(keys: string[]): Promise<void> {
    if (!keys.length) return;

    await this.mediaModel.deleteMany({ key: { $in: keys } }).exec();
  }

  async findById(id: string): Promise<MediaResource> {
    const media = await this.mediaModel.findOne({ id }).exec();
    return this.convert(media);
  }

  async findOne(props: { type: string; subtype: string; key: string }): Promise<MediaResource> {
    const media = await this.mediaModel
      .findOne({
        type: props.type,
        subtype: props.subtype,
        key: props.key,
      })
      .exec();
    return this.convert(media);
  }

  async findByTypeIdAndNotKeys(props: {
    type: string;
    subtype: string;
    typeId: string;
    keys: string[];
  }): Promise<MediaResource[]> {
    const media = await this.mediaModel
      .find({
        type: props.type,
        subtype: props.subtype,
        typeId: props.typeId,
        ...(props.keys.length && { key: { $nin: props.keys } }),
      })
      .exec();
    return this.convert(media);
  }

  async findByKeys(props: {
    type: string;
    subtype: string;
    keys: string[];
  }): Promise<MediaResource[]> {
    if (!props.keys.length) return [];

    const media = await this.mediaModel
      .find({ type: props.type, subtype: props.subtype, key: { $in: props.keys } })
      .sort({ key: 1 })
      .exec();
    return this.convert(media);
  }

  async findToBeDeleted(props: {
    type: string;
    subtypes?: string[];
    typeIds?: string[];
  }): Promise<string[]> {
    if (props.subtypes && !props.subtypes.length) return [];
    if (props.typeIds && !props.typeIds.length) return [];

    const records = await this.mediaModel
      .find(
        {
          type: props.type,
          ...(props.subtypes && { subtype: { $in: props.subtypes } }),
          ...(props.typeIds && { typeId: { $in: props.typeIds } }),
        },
        { _id: 0, key: 1 },
      )
      .exec();
    return records.map((x) => x.key);
  }

  private convert(data: MediaResourceDocument): MediaResource;
  private convert(data: MediaResourceDocument[]): MediaResource[];
  private convert(data: MediaResourceDocument | MediaResourceDocument[]) {
    if (!data) return;
    if (Array.isArray(data)) return data.map((item) => this.convert(item));

    const resource = new MediaResource();
    Object.assign(resource, data.toJSON());

    delete resource['_id'];
    delete resource['__v'];
    return resource;
  }
}
