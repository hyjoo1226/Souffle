import { Controller, Get, Req, Query, UseGuards } from '@nestjs/common';
import { NoteService } from './notes.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/v1/notes/folder')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  // 오답노트 폴더 조회 API
  // @UseGuards(AuthGuard('jwt'))
  @Get()
  async getFolders(
    // @Req() req,
    @Query('type') type?: number,
  ) {
    const userId = 1;
    // const userId = req.user.id;
    return this.noteService.getNoteFolderTree(userId, type);
  }
}
