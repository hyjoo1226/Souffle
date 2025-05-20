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
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { NoteService } from './notes.service';
import { CreateNoteFolderDto } from './dto/create-note-folder.dto';
import {
  UpdateNoteFolderDto,
  UpdateNoteFolderOrderDto,
} from './dto/update-note-folder.dto';
import { AddToFolderDto } from './dto/add-note.dto';
import { MoveProblemFolderDto } from './dto/update-note.dto';
import { NoteStrokesResponseDto } from './dto/note-strokes.dto';
import { FolderProblemDto } from './dto/folder-problem.dto';

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
    description: '생성된 폴더 id',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 123 },
      },
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
    @Req() req,
  ) {
    const userId = req.user.id;

    return this.noteService.updateNoteFolderName(
      folderId,
      userId,
      updateDto.name,
    );
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
    @Req() req,
  ) {
    const userId = req.user.id;

    return this.noteService.updateNoteFolderOrder(
      folderId,
      userId,
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
  async deleteNoteFolder(@Param('folder_id') folderId: number, @Req() req) {
    const userId = req.user.id;

    return this.noteService.deleteNoteFolder(folderId, userId);
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

  // 문제 다른 폴더로 이동 API
  @ApiOperation({ summary: '문제 다른 폴더 이동' })
  @ApiParam({ name: 'problem_id', type: Number, description: '문제 번호' })
  @ApiBody({ type: MoveProblemFolderDto })
  @ApiResponse({ status: 200, description: '문제 폴더 이동 성공' })
  @ApiResponse({ status: 404, description: '폴더/문제 없음' })
  @UseGuards(AuthGuard('jwt'))
  @Patch('problem/:problem_id')
  async moveProblemFolder(
    @Param('problem_id') problemId: number,
    @Body() dto: MoveProblemFolderDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.noteService.moveProblemToFolder(
      userId,
      Number(problemId),
      dto.type,
      dto.folderId,
    );
  }

  // 노트 필기 스트로크 조회 API
  @ApiOperation({ summary: '오답노트 필기 스트로크 조회' })
  @ApiParam({ name: 'user_problem_id', type: Number })
  @ApiResponse({
    status: 200,
    type: NoteStrokesResponseDto,
    description: '스트로크 데이터 반환',
  })
  @ApiResponse({ status: 404, description: '필기 내용 없음' })
  @UseGuards(AuthGuard('jwt'))
  @Get('content/:user_problem_id/stroke')
  async getNoteStrokes(
    @Param('user_problem_id') userProblemId: number,
  ): Promise<NoteStrokesResponseDto> {
    return this.noteService.getNoteStrokes(Number(userProblemId));
  }

  // 노트 필기 스트로크 업데이트 API
  @Patch('content/:user_problem_id/stroke')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '필기 스트로크 업데이트' })
  @ApiParam({ name: 'user_problem_id', type: Number })
  @ApiResponse({ status: 200, type: NoteStrokesResponseDto })
  @ApiResponse({ status: 404, description: '필기 내용 없음' })
  async updateStrokes(
    @Param('user_problem_id') userProblemId: number,
    @Body() dto: NoteStrokesResponseDto,
  ): Promise<NoteStrokesResponseDto> {
    return this.noteService.updateStrokes(Number(userProblemId), dto);
  }

  // 폴더의 문제 목록 조회 API
  @ApiOperation({ summary: '폴더 내 문제 목록 조회' })
  @ApiParam({ name: 'folder_id', type: Number, description: '폴더 ID' })
  @ApiQuery({
    name: 'type',
    enum: [1, 2],
    required: true,
    description: '1: 즐겨찾기, 2: 오답노트',
  })
  @ApiResponse({ status: 200, type: [FolderProblemDto] })
  @UseGuards(AuthGuard('jwt'))
  @Get('folder/:folder_id/problem')
  async getFolderProblems(
    @Param('folder_id') folderId: number,
    @Query('type') type: number,
    @Req() req,
  ): Promise<FolderProblemDto[]> {
    const userId = req.user.id;
    return this.noteService.getFolderProblems(
      userId,
      Number(folderId),
      Number(type),
    );
  }

  // 노트의 문제 상세 조회 API
  @ApiOperation({ summary: '오답노트 문제 상세 조회' })
  @ApiParam({
    name: 'user_problem_id',
    type: Number,
    description: '사용자 문제 ID',
  })
  @ApiResponse({
    status: 200,
    description: '문제 상세 정보 조회 성공',
  })
  @ApiResponse({ status: 404, description: '문제 정보 없음' })
  @UseGuards(AuthGuard('jwt'))
  @Get('content/:user_problem_id')
  async getProblemDetail(@Param('user_problem_id') userProblemId: number) {
    return this.noteService.getProblemDetail(Number(userProblemId));
  }
}
