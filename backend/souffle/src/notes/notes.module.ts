import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteController } from './notes.controller';
import { NoteService } from './notes.service';
import { NoteFolder } from './entities/note-folder.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NoteFolder])],
  providers: [NoteService],
  controllers: [NoteController],
  exports: [TypeOrmModule],
})
export class NoteModule {}
