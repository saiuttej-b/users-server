import { DeleteObjectsCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MediaResourceRepository } from 'src/domain/repositories/media-resource.repository';
import { MediaResource } from 'src/domain/schemas/media-resource.schema';
import { ENV } from 'src/utils/config.constants';
import { UploadFileProps } from './media-resource.manager';

@Injectable()
export class AwsResourceManager {
  constructor(
    private readonly configService: ConfigService,
    private readonly mediaRepo: MediaResourceRepository,
  ) {}

  private getS3Client() {
    const client = new S3Client({
      region: this.configService.get<string>(ENV.AWS_S3_REGION),
      credentials: {
        accessKeyId: this.configService.get<string>(ENV.AWS_S3_ACCESS_KEY_ID),
        secretAccessKey: this.configService.get<string>(ENV.AWS_S3_SECRET_ACCESS_KEY),
      },
    });

    return {
      client,
      bucketName: this.configService.get<string>(ENV.AWS_S3_BUCKET_NAME),
    };
  }

  async uploadFile(props: UploadFileProps): Promise<MediaResource> {
    const { client, bucketName } = this.getS3Client();

    let uploadRes: unknown;

    try {
      uploadRes = await client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: props.key,
          Body: Buffer.from(props.file.buffer),
          ContentType: props.file.mimetype,
          Metadata: {
            typeId: props.typeId,
            type: props.type,
            subtype: props.subtype,
          },
        }),
      );
    } catch (err) {
      console.log(err);
      throw new UnprocessableEntityException('Error while uploading file, please try again later.');
    }

    const media = this.mediaRepo.instance();
    media.originalFileName = props.file.originalname;
    media.key = props.key;
    media.type = props.type;
    media.subtype = props.subtype;
    media.typeId = props.typeId || undefined;
    media.mimeType = props.file.mimetype;
    media.fileSize = props.file.size;
    media.uploadResponse = uploadRes;
    media.createdById = props.createdById;
    media.createdAt = new Date();
    await this.mediaRepo.save(media);

    return this.mediaRepo.findById(media.id);
  }

  async deleteFiles(key: string[]): Promise<void> {
    if (!key.length) return;

    const { client, bucketName } = this.getS3Client();

    try {
      await client.send(
        new DeleteObjectsCommand({
          Bucket: bucketName,
          Delete: {
            Objects: key.map((item) => ({ Key: item })),
          },
        }),
      );
    } catch (err) {
      console.log(err);
      throw new UnprocessableEntityException('Error while deleting file, please try again later.');
    }

    await this.mediaRepo.deleteByKeys(key);
  }
}
