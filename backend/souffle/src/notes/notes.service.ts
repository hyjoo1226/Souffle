import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoteFolder } from './entities/note-folder.entity';
import { CreateNoteFolderDto } from './dto/create-note-folder.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UserProblem } from 'src/users/entities/user-problem.entity';
import { NoteContent } from './entities/note-content.entity';
import { NoteStrokesResponseDto } from './dto/note-strokes.dto';
import { Submission } from 'src/submissions/entities/submission.entity';
import { SubmissionStep } from 'src/submissions/entities/submission-step.entity';

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(NoteFolder)
    private noteFolderRepository: Repository<NoteFolder>,
    @InjectRepository(UserProblem)
    private userProblemRepository: Repository<UserProblem>,
    @InjectRepository(NoteContent)
    private noteContentRepository: Repository<NoteContent>,
    @InjectRepository(Submission)
    private submissionRepository: Repository<Submission>,
    @InjectRepository(SubmissionStep)
    private submissionStepRepository: Repository<SubmissionStep>,
  ) {}

  // 오답노트 폴더 조회 API
  async getNoteFolderTree(userId: number, type?: number) {
    const folders = await this.noteFolderRepository.find({
      where: { user: { id: userId }, ...(type && { type }) },
    });

    const folderIds = folders.map((f) => f.id);

    // 폴더별 문제 개수 조회
    const problemCounts = await this.getProblemCountsByFolders(
      userId,
      folderIds,
      type || 2,
    );

    const folderMap = new Map<number, any>();
    folders.forEach((f) =>
      folderMap.set(f.id, {
        id: f.id,
        name: f.name,
        type: f.type,
        problem_count: problemCounts[f.id] || 0,
        children: [],
        parent_id: f.parent_id,
      }),
    );
    folders.forEach((f) => {
      if (f.parent_id) {
        const parent = folderMap.get(f.parent_id);
        if (parent) parent.children.push(folderMap.get(f.id));
      }
    });

    return folders.filter((f) => !f.parent_id).map((f) => folderMap.get(f.id));
  }

  // 폴더별 문제 개수 조회 메서드
  private async getProblemCountsByFolders(
    userId: number,
    folderIds: number[],
    type: number,
  ): Promise<Record<number, number>> {
    const folderField =
      type === 2 ? 'wrong_note_folder_id' : 'favorite_folder_id';

    const counts = await this.userProblemRepository
      .createQueryBuilder('up')
      .select([`up.${folderField} AS folder_id`, 'COUNT(*) as count'])
      .where('up.user_id = :userId', { userId })
      .andWhere(`up.${folderField} IN (:...folderIds)`, { folderIds })
      .groupBy(`up.${folderField}`)
      .getRawMany();

    return counts.reduce((acc, curr) => {
      acc[curr.folder_id] = parseInt(curr.count, 10);
      return acc;
    }, {});
  }

  // 오답노트 폴더 생성 API
  async createNoteFolder(userId: number, createFolderDto: CreateNoteFolderDto) {
    // 같은 부모 아래에서 가장 큰 sort_order 값 찾기
    const maxOrderResult = await this.noteFolderRepository
      .createQueryBuilder('folder')
      .select('MAX(folder.sort_order)', 'maxOrder')
      .where('folder.user_id = :userId', { userId })
      .andWhere(
        createFolderDto.parent_id
          ? 'folder.parent_id = :parentId'
          : 'folder.parent_id IS NULL',
        createFolderDto.parent_id
          ? { parentId: createFolderDto.parent_id }
          : {},
      )
      .getRawOne();
    // 최대값 + 1 또는 0 (첫 번째 폴더인 경우)
    const nextSortOrder =
      maxOrderResult.maxOrder !== null ? maxOrderResult.maxOrder + 1 : 0;

    // 새 폴더 생성
    const newFolder = this.noteFolderRepository.create({
      name: createFolderDto.name,
      type: createFolderDto.type,
      parent: createFolderDto.parent_id
        ? { id: createFolderDto.parent_id }
        : null,
      user: { id: userId },
      sort_order: nextSortOrder,
    });

    const savedFolder = await this.noteFolderRepository.save(newFolder);

    return { folder_id: savedFolder.id };
  }

  // 폴더 이름 변경 API
  async updateNoteFolderName(folderId: number, name: string) {
    const folder = await this.noteFolderRepository.findOne({
      where: { id: folderId },
    });
    if (!folder) throw new NotFoundException('폴더를 찾을 수 없습니다.');

    folder.name = name;
    return this.noteFolderRepository.save(folder);
  }

  // 폴더 순서 변경 API
  async updateNoteFolderOrder(folderId: number, sort_order: number) {
    // 이동할 폴더 찾기
    const folder = await this.noteFolderRepository.findOne({
      where: { id: folderId },
    });
    if (!folder) throw new NotFoundException('폴더를 찾을 수 없습니다.');

    // 원래 순서와 새 순서 저장
    const originalOrder = folder.sort_order;
    const newOrder = sort_order;

    // 순서가 같으면 변경 없음
    if (originalOrder === newOrder) {
      return folder;
    }

    // 같은 유저의 같은 부모 아래의 폴더들만 조정
    const queryBuilder = this.noteFolderRepository.createQueryBuilder();
    queryBuilder.where('user_id = :userId', { userId: folder.user_id });

    // 부모 ID 조건 추가 (null 고려)
    if (folder.parent_id === null) {
      queryBuilder.andWhere('parent_id IS NULL');
    } else {
      queryBuilder.andWhere('parent_id = :parentId', {
        parentId: folder.parent_id,
      });
    }

    // 폴더를 위로 이동
    if (newOrder < originalOrder) {
      await queryBuilder
        .update(NoteFolder)
        .set({ sort_order: () => 'sort_order + 1' })
        .andWhere('sort_order >= :newOrder', { newOrder })
        .andWhere('sort_order < :originalOrder', { originalOrder })
        .execute();
    }
    // 폴더를 아래로 이동
    else {
      await queryBuilder
        .update(NoteFolder)
        .set({ sort_order: () => 'sort_order - 1' })
        .andWhere('sort_order > :originalOrder', { originalOrder })
        .andWhere('sort_order <= :newOrder', { newOrder })
        .execute();
    }

    // 이동할 폴더의 순서 변경
    folder.sort_order = newOrder;
    return this.noteFolderRepository.save(folder);
  }

  // 폴더 삭제 API
  async deleteNoteFolder(folderId: number) {
    const folder = await this.noteFolderRepository.findOne({
      where: { id: folderId },
    });
    if (!folder) throw new NotFoundException('폴더를 찾을 수 없습니다.');

    // 고정 폴더(예: id 0, 1, 2)는 삭제 불가
    if ([0, 1, 2].includes(folderId)) {
      throw new BadRequestException('고정 폴더는 삭제할 수 없습니다.');
    }

    await this.noteFolderRepository.delete(folderId);
    return { message: '폴더가 삭제되었습니다.' };
  }

  // 문제 오답노트에 추가 API
  async addToNoteFolder(
    userId: number,
    problemId: number,
    folderId: number,
    type: number,
  ) {
    const folder = await this.noteFolderRepository.findOne({
      where: { id: folderId },
    });
    if (!folder) {
      throw new NotFoundException('존재하지 않는 폴더입니다.');
    }
    if ([1, 2, 3].includes(folderId)) {
      throw new BadRequestException('최상위 폴더에는 추가할 수 없습니다.');
    }

    const userProblem = await this.userProblemRepository.findOne({
      where: {
        user: { id: userId },
        problem: { id: problemId },
      },
    });
    if (!userProblem) {
      throw new NotFoundException('문제 기록이 존재하지 않습니다.');
    }

    if (type === 1) {
      userProblem.favorite_folder_id = folderId;
    } else if (type === 2) {
      userProblem.wrong_note_folder_id = folderId;
    } else {
      throw new BadRequestException('유효하지 않은 폴더 유형입니다.');
    }

    // note_content 생성 (없는 경우)
    const savedUserProblem = await this.userProblemRepository.save(userProblem);
    const existingContent = await this.noteContentRepository.findOne({
      where: { user_problem: { id: savedUserProblem.id } },
    });
    if (!existingContent) {
      const newContent = this.noteContentRepository.create({
        user_problem: savedUserProblem,
        solution_strokes: [],
        concept_strokes: [],
      });
      await this.noteContentRepository.save(newContent);
    }

    return savedUserProblem;
  }

  // 문제 오답노트에서 제거 API
  async removeFromNoteFolder(userId: number, problemId: number, type: number) {
    const userProblem = await this.userProblemRepository.findOne({
      where: { user: { id: userId }, problem: { id: problemId } },
    });
    if (!userProblem) throw new NotFoundException('문제 기록이 없습니다.');

    if (type === 1) {
      userProblem.favorite_folder_id = null;
    } else if (type === 2) {
      userProblem.wrong_note_folder_id = null;
    } else {
      throw new BadRequestException('유효하지 않은 타입입니다.');
    }

    return this.userProblemRepository.save(userProblem);
  }

  // 문제 다른 폴더로 이동 API
  async moveProblemToFolder(
    userId: number,
    problemId: number,
    type: number,
    folderId: number,
  ) {
    const folder = await this.noteFolderRepository.findOne({
      where: { id: folderId },
    });
    if (!folder) throw new NotFoundException('존재하지 않는 폴더입니다.');
    if ([1, 2, 3].includes(folderId))
      throw new BadRequestException('시스템 폴더로 이동 불가');

    const userProblem = await this.userProblemRepository.findOne({
      where: { user: { id: userId }, problem: { id: problemId } },
    });
    if (!userProblem) throw new NotFoundException('문제 기록이 없습니다.');

    if (type === 1) {
      userProblem.favorite_folder_id = folderId;
    } else if (type === 2) {
      userProblem.wrong_note_folder_id = folderId;
    } else {
      throw new BadRequestException('유효하지 않은 폴더 유형입니다.');
    }

    return this.userProblemRepository.save(userProblem);
  }

  // 필기 스트로크 조회 API
  async getNoteStrokes(userProblemId: number): Promise<NoteStrokesResponseDto> {
    const noteContent = await this.noteContentRepository.findOne({
      where: { user_problem: { id: userProblemId } },
    });

    if (!noteContent) {
      throw new NotFoundException('필기 내용이 존재하지 않습니다.');
    }

    return {
      solution_strokes: noteContent.solution_strokes,
      concept_strokes: noteContent.concept_strokes,
    };
  }

  // 필기 스트로크 업데이트 API
  async updateStrokes(
    userProblemId: number,
    dto: NoteStrokesResponseDto,
  ): Promise<NoteStrokesResponseDto> {
    const noteContent = await this.noteContentRepository.findOne({
      where: { user_problem: { id: userProblemId } },
    });
    if (!noteContent) {
      throw new NotFoundException('필기 내용이 존재하지 않습니다.');
    }

    noteContent.solution_strokes = dto.solution_strokes;
    noteContent.concept_strokes = dto.concept_strokes;

    const updated = await this.noteContentRepository.save(noteContent);
    return {
      solution_strokes: updated.solution_strokes,
      concept_strokes: updated.concept_strokes,
    };
  }

  // 폴더의 문제 목록 조회 API
  async getFolderProblems(userId: number, folderId: number, type: number) {
    const folderField =
      type === 1 ? 'favorite_folder_id' : 'wrong_note_folder_id';

    const query = this.userProblemRepository
      .createQueryBuilder('up')
      .select([
        'p.id AS problem_id',
        'up.id AS user_problem_id',
        'c.name AS category_name',
        'p."innerNo" AS inner_no',
        'p.type AS problem_type',
        'p.content AS content',
        'p.choice AS choice',
        'up.try_count AS try_count',
        'up.correct_count AS correct_count',
        'up.last_submission_id AS last_submission_id',
      ])
      .innerJoin('up.problem', 'p')
      .innerJoin('p.category', 'c')
      .where(`up.user_id = :userId`, { userId })
      .andWhere(`up.${folderField} = :folderId`, { folderId });

    const rawResults = await query.getRawMany();

    return rawResults.map((result) => ({
      problem_id: result.problem_id,
      user_problem_id: result.user_problem_id,
      category_name: result.category_name,
      inner_no: result.inner_no,
      problem_type: result.problem_type,
      content: result.content,
      choice: result.choice,
      user: {
        try_count: result.try_count,
        correct_count: result.correct_count,
        last_submission_id: result.last_submission_id,
      },
    }));
  }

  // 노트의 문제 상세 조회 API
  async getProblemDetail(userProblemId: number) {
    // user_problem
    const userProblem = await this.userProblemRepository.findOne({
      where: { id: userProblemId },
      relations: ['problem', 'problem.book', 'problem.category'],
    });

    if (!userProblem) {
      throw new NotFoundException('문제 정보를 찾을 수 없습니다.');
    }

    // note_content
    const noteContent = await this.noteContentRepository.findOne({
      where: { user_problem: { id: userProblemId } },
    });

    // 가장 최근 submission
    const lastSubmission = await this.submissionRepository.findOne({
      where: { id: userProblem.last_submission_id },
    });

    // submission_steps
    const submissionSteps = lastSubmission
      ? await this.submissionStepRepository.find({
          where: { submission: { id: lastSubmission.id } },
          order: { stepNumber: 'ASC' },
        })
      : [];

    // 카테고리 계층 구조 조회 (재귀 쿼리)
    const categoryWithHierarchy = await this.getCategoryHierarchy(
      userProblem.problem.category.id,
    );

    return {
      // 문제 정보
      problem_id: userProblem.problem.id,
      content: userProblem.problem.content,
      choice: userProblem.problem.choice,
      problem_image_url: userProblem.problem.problemImageUrl,
      answer: userProblem.problem.answer,
      explanation: userProblem.problem.explanation,
      explanation_image_url: userProblem.problem.explanationImageUrl,
      inner_no: userProblem.problem.innerNo,

      // 필기 정보
      solution_strokes: noteContent?.solution_strokes || [],
      concept_strokes: noteContent?.concept_strokes || [],

      // 책 정보
      book_name: userProblem.problem.book.name,
      publisher: userProblem.problem.book.publisher,
      year: userProblem.problem.book.year,

      // 카테고리 정보
      category: categoryWithHierarchy,

      // 제출 정보
      total_solve_time: lastSubmission?.totalSolveTime,
      understand_time: lastSubmission?.understandTime,
      solve_time: lastSubmission?.solveTime,
      review_time: lastSubmission?.reviewTime,
      answer_convert: lastSubmission?.answerConvert,
      full_step_image_url: lastSubmission?.fullStepImageUrl,
      is_correct: lastSubmission?.isCorrect,
      ai_analysis: lastSubmission?.aiAnalysis,
      weakness: lastSubmission?.weakness,

      // 제출 단계 정보
      submission_steps: submissionSteps.map((step) => ({
        step_number: step.stepNumber,
        step_image_url: step.stepImageUrl,
        step_time: step.stepTime,
        step_valid: step.isValid,
        step_feedback: step.stepFeedback,
        step_latex: step.latex,
      })),
    };
  }

  // 카테고리 계층 구조 조회
  private async getCategoryHierarchy(categoryId: number) {
    const query = `
      WITH RECURSIVE category_tree AS (
        SELECT id, name, "parentId"
        FROM categories
        WHERE id = $1
        UNION ALL
        SELECT c.id, c.name, c."parentId"
        FROM categories c
        JOIN category_tree ct ON c.id = ct."parentId"
      )
      SELECT * FROM category_tree
    `;

    const categories = await this.userProblemRepository.query(query, [
      categoryId,
    ]);

    // 계층 구조로 변환
    const categoryMap = new Map();
    categories.forEach((c) =>
      categoryMap.set(c.id, {
        id: c.id,
        name: c.name,
        parent: null,
      }),
    );

    // 부모-자식 관계 설정
    categories.forEach((c) => {
      if (c.parent_id && categoryMap.has(c.parent_id)) {
        const category = categoryMap.get(c.id);
        category.parent = categoryMap.get(c.parent_id);
      }
    });

    // 루트 카테고리 반환
    return categoryMap.get(categoryId);
  }
}
