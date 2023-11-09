import { Notes } from '../schemas/notes.schema';

export abstract class NotesRepository {
  abstract instance(data?: Partial<Notes>): Notes;

  abstract create(notes: Notes): Promise<Notes>;

  abstract save(notes: Notes): Promise<Notes>;

  abstract deleteById(id: string): Promise<void>;

  abstract findById(id: string): Promise<Notes>;

  abstract find(query: { userId?: string }): Promise<Notes[]>;
}
