import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NoteService } from './notes.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateNoteFolderDto } from './dto/create-note-folder.dto';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@Controller('api/v1/notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  // 오답노트 폴더 조회 API
  @ApiTags('Note')
  @ApiOperation({ summary: '오답노트 폴더 조회 API' })
  @ApiQuery({
    name: 'type',
    required: false,
    description: '폴더 타입 (1: 즐겨찾기, 2: 오답노트)',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: '폴더 트리 목록 반환',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          type: { type: 'integer' },
          children: {
            type: 'array',
            items: { $ref: '#/components/schemas/NoteFolder' },
          },
          parent_id: {
            type: 'integer',
            nullable: true,
          },
          sort_order: { type: 'integer' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  // @UseGuards(AuthGuard('jwt'))
  @Get('folder')
  async getFolders(
    // @Req() req,
    @Query('type') type?: number,
  ) {
    const userId = 1;
    // const userId = req.user.id;
    return this.noteService.getNoteFolderTree(userId, type);
  }

  // 오답노트 폴더 생성 API
  @ApiTags('Note')
  @ApiOperation({ summary: '오답노트 폴더 생성 API' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: '새 폴더' },
        type: { type: 'integer', example: 1 },
        parent_id: {
          type: 'integer',
          nullable: true,
        },
      },
      required: ['name', 'type'],
    },
  })
  @ApiResponse({
    status: 201,
    description: '생성된 폴더 정보',
    schema: {
      $ref: '#/components/schemas/NoteFolder',
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  // @UseGuards(AuthGuard('jwt'))
  @Post('folder')
  async createNoteFolder(
    @Body() createFolderDto: CreateNoteFolderDto,
    // @Req() req,
  ) {
    const userId = 1;
    // const userId = req.user.id;
    return this.noteService.createNoteFolder(userId, createFolderDto);
  }
}
