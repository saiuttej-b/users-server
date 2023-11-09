import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export const NotesCName = 'notes';
export type NotesDocument = HydratedDocument<Notes>;

@Schema({ collection: NotesCName, timestamps: true })
export class Notes {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  content?: string;

  @Prop({ required: true })
  userId: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const NotesSchema = SchemaFactory.createForClass(Notes);
