import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { NotesRepository } from 'src/domain/repositories/notes.repository';
import { getUser } from 'src/utils/request-store/request-store';
import { NotesPostDto } from '../dtos/notes.dto';

@Injectable()
export class NotesService {
  constructor(private readonly notesRepo: NotesRepository) {}

  async createNotes(reqBody: NotesPostDto) {
    const notes = this.notesRepo.instance(reqBody);
    notes.userId = getUser().id;
    return this.notesRepo.create(notes);
  }

  async updateNotes(id: string, reqBody: NotesPostDto) {
    const notes = await this.notesRepo.findById(id);
    if (!notes) {
      throw new NotFoundException('Notes not found');
    }
    if (notes.userId !== getUser().id) {
      throw new BadRequestException('You are not allowed to update this notes');
    }

    Object.assign(notes, reqBody);
    return this.notesRepo.save(notes);
  }

  async deleteNotes(id: string) {
    const notes = await this.notesRepo.findById(id);
    if (!notes) {
      throw new NotFoundException('Notes not found');
    }
    if (notes.userId !== getUser().id) {
      throw new BadRequestException('You are not allowed to delete this notes');
    }

    await this.notesRepo.deleteById(id);
    return {
      message: 'Notes deleted successfully',
    };
  }

  async findNotes() {
    return this.notesRepo.find({ userId: getUser().id });
  }
}
