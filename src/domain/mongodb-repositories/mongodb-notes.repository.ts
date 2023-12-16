import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { generateId } from 'src/utils/util-functions';
import { NotesRepository } from '../repositories/notes.repository';
import { Notes, NotesDocument } from '../schemas/notes.schema';

@Injectable()
export class MongoDBNotesRepository implements NotesRepository {
  constructor(@InjectModel(Notes.name) private readonly notesModel: Model<Notes>) {}

  instance(data?: Partial<Notes>): Notes {
    const notes = new Notes();
    if (data) Object.assign(notes, data);
    if (!notes.id) notes.id = generateId();

    return notes;
  }

  async create(notes: Notes): Promise<Notes> {
    if (!notes.id) notes.id = generateId();

    const record = await this.notesModel.create(notes);
    return this.convert(record);
  }

  async save(notes: Notes): Promise<Notes> {
    if (!notes.id) return this.create(notes);

    const previous = await this.notesModel.findOne({ id: notes.id }).exec();
    if (!previous) return this.create(notes);

    Object.assign(previous, notes);
    if (!previous.isModified()) return notes;

    const record = await previous.save();
    return this.convert(record);
  }

  async deleteById(id: string): Promise<void> {
    await this.notesModel.deleteOne({ id }).exec();
  }

  async findById(id: string): Promise<Notes> {
    const record = await this.notesModel.findOne({ id }).exec();
    return this.convert(record);
  }

  async find(query: { userId?: string }): Promise<Notes[]> {
    const records = await this.notesModel
      .find({ ...(query.userId ? { userId: query.userId } : {}) })
      .exec();
    return this.convert(records);
  }

  private convert(value: NotesDocument): Notes;
  private convert(value: NotesDocument[]): Notes[];
  private convert(value: NotesDocument | NotesDocument[]): Notes | Notes[] {
    if (!value) return;
    if (Array.isArray(value)) return value.map((v) => this.convert(v));

    const notes = new Notes();
    Object.assign(notes, value.toJSON());

    delete notes['_id'];
    delete notes['__v'];
    return notes;
  }
}
