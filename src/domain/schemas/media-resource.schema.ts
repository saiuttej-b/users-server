import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export const MediaResourceCName = 'media_resources';

export type MediaResourceDocument = HydratedDocument<MediaResource>;

@Schema({ collection: MediaResourceCName })
export class MediaResource {
  @Prop({ required: true })
  id: string;

  @Prop()
  originalFileName: string;

  @Prop({ required: true })
  key: string;

  @Prop()
  type: string;

  @Prop()
  subtype: string;

  @Prop()
  typeId: string;

  @Prop()
  mediaType: string;

  @Prop()
  mimeType: string;

  @Prop({ type: MongooseSchema.Types.BigInt, get: (v: any) => (v != null ? Number(v) : null) })
  fileSize: number;

  @Prop({ type: MongooseSchema.Types.Mixed, select: false })
  uploadResponse: any;

  @Prop()
  createdById: string;

  @Prop()
  createdAt: Date;

  url: string;
}

export const MediaResourceSchema = SchemaFactory.createForClass(MediaResource);
MediaResourceSchema.index({ id: -1 }, { unique: true });
MediaResourceSchema.index({ key: 1 }, { unique: true });
MediaResourceSchema.index({ type: 1, subtype: 1, typeId: 1 });

MediaResourceSchema.virtual('url').get(function () {
  return `${process.env.AWS_S3_BUCKET_BASE_URL}/${this.key}`;
});

export const MediaResourceSubSchema = SchemaFactory.createForClass(MediaResource);
MediaResourceSubSchema.set('_id', false);

MediaResourceSubSchema.virtual('url').get(function () {
  return `${process.env.AWS_S3_BUCKET_BASE_URL}/${this.key}`;
});
