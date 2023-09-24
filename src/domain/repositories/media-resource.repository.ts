import { MediaResource } from '../schemas/media-resource.schema';

export abstract class MediaResourceRepository {
  abstract instance(data?: Partial<MediaResource>): MediaResource;

  abstract create(media: MediaResource): Promise<MediaResource>;

  abstract save(media: MediaResource): Promise<MediaResource>;

  abstract updateTypeId(keys: string[], typeId: string): Promise<void>;

  abstract deleteByKeys(keys: string[]): Promise<void>;

  abstract findById(id: string): Promise<MediaResource>;

  abstract findOne(props: { type: string; subtype: string; key: string }): Promise<MediaResource>;

  abstract findByTypeIdAndNotKeys(props: {
    type: string;
    subtype: string;
    typeId: string;
    keys: string[];
  }): Promise<MediaResource[]>;

  abstract findByKeys(props: {
    type: string;
    subtype: string;
    keys: string[];
  }): Promise<MediaResource[]>;

  abstract findToBeDeleted(props: {
    type: string;
    subtypes?: string[];
    typesIds?: string[];
  }): Promise<string[]>;
}
