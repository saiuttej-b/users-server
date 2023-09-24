import { MediaResource } from 'src/domain/schemas/media-resource.schema';

export type UploadFileProps = {
  file: Express.Multer.File;
  type: string;
  subtype: string;
  key: string;
  typeId?: string;
  createdById?: string;
};

export abstract class MediaResourceManager {
  abstract uploadFile(props: UploadFileProps): Promise<MediaResource>;

  abstract deleteFiles(keys: string[]): Promise<void>;
}
