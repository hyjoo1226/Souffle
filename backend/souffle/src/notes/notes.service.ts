import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsNull } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { NoteFolder } from './entities/note-folder.entity';
import { UserProblem } from 'src/users/entities/user-problem.entity';
import { NoteContent } from './entities/note-content.entity';
import { Submission } from 'src/submissions/entities/submission.entity';
import { SubmissionStep } from 'src/submissions/entities/submission-step.entity';
import { NoteStrokesResponseDto } from './dto/note-strokes.dto';
import { CreateNoteFolderDto } from './dto/create-note-folder.dto';

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
      where: [
        { user: { id: userId }, ...(type && { type }) },
        { user: IsNull() },
      ],
      order: { sort_order: 'ASC' },
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

    const roots: any[] = [];
    folders.forEach((f) => {
      const folderObj = folderMap.get(f.id);
      if (f.parent_id) {
        const parent = folderMap.get(f.parent_id);
        if (parent) parent.children.push(folderObj);
      } else {
        roots.push(folderObj);
      }
    });

    // 상위 폴더 문제 개수
    function accumulateProblemCount(folder: any): number {
      if (!folder.children || folder.children.length === 0) {
        return folder.problem_count;
      }
      let sum = folder.problem_count;
      for (const child of folder.children) {
        sum += accumulateProblemCount(child);
      }
      folder.problem_count = sum;
      return sum;
    }
    roots.forEach(accumulateProblemCount);

    return roots;
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

    if (!folderIds.length) {
      return {};
    }

    return counts.reduce((acc, curr) => {
      acc[curr.folder_id] = parseInt(curr.count, 10);
      return acc;
    }, {});
  }

  // 오답노트 폴더 생성 API
  async createNoteFolder(userId: number, createFolderDto: CreateNoteFolderDto) {
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

    const nextSortOrder =
      maxOrderResult.maxOrder !== null ? maxOrderResult.maxOrder + 1 : 0;
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
  async updateNoteFolderName(folderId: number, userId: number, name: string) {
    const folder = await this.noteFolderRepository.findOne({
      where: { id: folderId },
    });
    if (!folder) throw new NotFoundException('폴더를 찾을 수 없습니다.');

    if (folder.type === 1 && folder.parent_id === null) {
      throw new BadRequestException(
        '즐겨찾기 최상위 폴더는 삭제할 수 없습니다.',
      );
    }

    if (folder.user_id === null) {
      throw new BadRequestException('공통 폴더의 이름은 변경할 수 없습니다.');
    }

    if (folder.user_id !== userId) {
      throw new BadRequestException('자신의 폴더만 수정할 수 있습니다.');
    }

    folder.name = name;
    return this.noteFolderRepository.save(folder);
  }

  // 폴더 순서 변경 API
  async updateNoteFolderOrder(
    folderId: number,
    userId: number,
    sort_order: number,
  ) {
    const folder = await this.noteFolderRepository.findOne({
      where: { id: folderId },
    });
    if (!folder) throw new NotFoundException('폴더를 찾을 수 없습니다.');

    if (folder.type === 1 && folder.parent_id === null) {
      throw new BadRequestException(
        '즐겨찾기 최상위 폴더의 순서는 변경할 수 없습니다.',
      );
    }

    if (folder.user_id === null) {
      throw new BadRequestException('공통 폴더의 순서는 변경할 수 없습니다.');
    }

    if (folder.user_id !== userId) {
      throw new BadRequestException('자신의 폴더만 순서를 변경할 수 있습니다.');
    }

    const originalOrder = folder.sort_order;
    const newOrder = sort_order;

    if (originalOrder === newOrder) {
      return folder;
    }
    const queryBuilder = this.noteFolderRepository.createQueryBuilder();
    queryBuilder.where('user_id = :userId', { userId: folder.user_id });

    if (folder.parent_id === null) {
      queryBuilder.andWhere('parent_id IS NULL');
    } else {
      queryBuilder.andWhere('parent_id = :parentId', {
        parentId: folder.parent_id,
      });
    }

    if (newOrder < originalOrder) {
      await queryBuilder
        .update(NoteFolder)
        .set({ sort_order: () => 'sort_order + 1' })
        .andWhere('sort_order >= :newOrder', { newOrder })
        .andWhere('sort_order < :originalOrder', { originalOrder })
        .execute();
    } else {
      await queryBuilder
        .update(NoteFolder)
        .set({ sort_order: () => 'sort_order - 1' })
        .andWhere('sort_order > :originalOrder', { originalOrder })
        .andWhere('sort_order <= :newOrder', { newOrder })
        .execute();
    }
    folder.sort_order = newOrder;
    return this.noteFolderRepository.save(folder);
  }

  // 폴더 삭제 API
  async deleteNoteFolder(folderId: number, userId: number) {
    const folder = await this.noteFolderRepository.findOne({
      where: { id: folderId },
    });
    if (!folder) throw new NotFoundException('폴더를 찾을 수 없습니다.');

    if (folder.type === 1 && folder.parent_id === null) {
      throw new BadRequestException(
        '즐겨찾기 최상위 폴더는 삭제할 수 없습니다.',
      );
    }

    if (folder.user_id === null) {
      throw new BadRequestException('공통 폴더는 삭제할 수 없습니다.');
    }

    if (folder.user_id !== userId) {
      throw new BadRequestException('자신의 폴더만 삭제할 수 있습니다.');
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

    const savedUserProblem = await this.userProblemRepository.save(userProblem);

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
    const userProblem = await this.userProblemRepository.findOne({
      where: { id: userProblemId },
      relations: ['problem', 'problem.book', 'problem.category'],
    });

    if (!userProblem) {
      throw new NotFoundException('문제 정보를 찾을 수 없습니다.');
    }

    const noteContent = await this.noteContentRepository.findOne({
      where: { user_problem: { id: userProblemId } },
    });

    // 가장 최근 submission
    const lastSubmission = await this.submissionRepository.findOne({
      where: { id: userProblem.last_submission_id },
    });

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
        step_current_latex: step.currentLatex,
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

    const categoryMap = new Map();
    categories.forEach((c) =>
      categoryMap.set(c.id, {
        id: c.id,
        name: c.name,
        parent: null,
      }),
    );

    categories.forEach((c) => {
      if (c.parent_id && categoryMap.has(c.parent_id)) {
        const category = categoryMap.get(c.id);
        category.parent = categoryMap.get(c.parent_id);
      }
    });

    return categoryMap.get(categoryId);
  }

  // 새 유저를 위한 폴더 생성
  async createDefaultFoldersForUser(userId: number): Promise<void> {
    const favoriteFolder = await this.noteFolderRepository.save({
      user: { id: userId },
      type: 1,
      name: '즐겨찾기',
      parent: null,
      sort_order: 0,
    });
  }
}
