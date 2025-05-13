import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Req,
  Query,
  UseGuards,
  Param,
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
  ApiParam,
} from '@nestjs/swagger';
import {
  UpdateNoteFolderDto,
  UpdateNoteFolderOrderDto,
} from './dto/update-note-folder.dto';
import { AddToFolderDto } from './dto/add-note.dto';

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
  @UseGuards(AuthGuard('jwt'))
  @Get('folder')
  async getFolders(@Req() req, @Query('type') type?: number) {
    const userId = req.user.id;
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
  @UseGuards(AuthGuard('jwt'))
  @Post('folder')
  async createNoteFolder(
    @Body() createFolderDto: CreateNoteFolderDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.noteService.createNoteFolder(userId, createFolderDto);
  }

  // 폴더 이름 변경 API
  @ApiOperation({ summary: '오답노트 폴더 이름 변경' })
  @ApiParam({ name: 'folder_id', type: Number, description: '폴더 ID' })
  @ApiBody({
    type: UpdateNoteFolderDto,
    description: '변경할 폴더 이름',
  })
  @ApiResponse({ status: 200, description: '변경된 폴더 정보 반환' })
  @UseGuards(AuthGuard('jwt'))
  @Patch('folder/:folder_id')
  async updateFolderName(
    @Param('folder_id') folderId: number,
    @Body() updateDto: UpdateNoteFolderDto,
  ) {
    return this.noteService.updateNoteFolderName(folderId, updateDto.name);
  }

  // 폴더 순서 변경 API
  @ApiOperation({ summary: '오답노트 폴더 순서 변경' })
  @ApiParam({ name: 'folder_id', type: Number, description: '폴더 ID' })
  @ApiBody({
    type: UpdateNoteFolderOrderDto,
    description: '변경할 sort_order 값',
  })
  @ApiResponse({ status: 200, description: '변경된 폴더 정보 반환' })
  @UseGuards(AuthGuard('jwt'))
  @Patch('folder/:folder_id/order')
  async updateFolderOrder(
    @Param('folder_id') folderId: number,
    @Body() updateDto: UpdateNoteFolderOrderDto,
  ) {
    return this.noteService.updateNoteFolderOrder(
      folderId,
      updateDto.sort_order,
    );
  }

  // 폴더 삭제 API
  @ApiOperation({ summary: '오답노트 폴더 삭제' })
  @ApiParam({ name: 'folder_id', type: Number, description: '폴더 ID' })
  @ApiResponse({ status: 200, description: '폴더 삭제 성공' })
  @ApiResponse({ status: 404, description: '폴더를 찾을 수 없음' })
  @UseGuards(AuthGuard('jwt'))
  @Delete('folder/:folder_id')
  async deleteNoteFolder(@Param('folder_id') folderId: number) {
    return this.noteService.deleteNoteFolder(folderId);
  }

  // 문제 오답노트에 추가 API
  @ApiOperation({ summary: '문제를 오답노트 폴더에 추가' })
  @ApiBody({ type: AddToFolderDto })
  @ApiResponse({ status: 200, description: '폴더 추가 성공' })
  @ApiResponse({ status: 404, description: '폴더/문제 없음' })
  @UseGuards(AuthGuard('jwt'))
  @Post('problem/add')
  async addToFolder(@Body() dto: AddToFolderDto, @Req() req) {
    const userId = req.user.id;
    return this.noteService.addToNoteFolder(
      userId,
      dto.problemId,
      dto.folderId,
      dto.type,
    );
  }

  // 문제 오답노트에서 제거 API
  @ApiOperation({ summary: '문제를 오답노트 폴더에서 제거' })
  @ApiResponse({ status: 200, description: '문제 제거거 성공' })
  @ApiResponse({ status: 404, description: 'user_problem 없음' })
  @UseGuards(AuthGuard('jwt'))
  @Delete('problem/:problem_id')
  async removeFromFolder(
    @Param('problem_id') problemId: number,
    @Query('type') type: number,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.noteService.removeFromNoteFolder(
      userId,
      Number(problemId),
      Number(type),
    );
  }
}
