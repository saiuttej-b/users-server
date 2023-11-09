import { Module } from '@nestjs/common';
import { DomainModule } from 'src/domain/domain.module';
import { NotesController } from './controllers/notes.controller';
import { NotesService } from './services/notes.service';

@Module({
  imports: [DomainModule],
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}
