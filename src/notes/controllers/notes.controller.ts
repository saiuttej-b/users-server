import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/decorators/user-auth.decorators';
import { NotesPostDto } from '../dtos/notes.dto';
import { NotesService } from '../services/notes.service';

@JwtAuthGuard()
@Controller('notes')
export class NotesController {
  constructor(private readonly service: NotesService) {}

  @Post()
  createNotes(@Body() reqBody: NotesPostDto) {
    return this.service.createNotes(reqBody);
  }

  @Put(':id')
  updateNotes(@Body() reqBody: NotesPostDto, @Param('id') id: string) {
    return this.service.updateNotes(id, reqBody);
  }

  @Delete(':id')
  deleteNotes(@Param('id') id: string) {
    return this.service.deleteNotes(id);
  }

  @Get('my-notes')
  findNotes() {
    return this.service.findNotes();
  }
}
