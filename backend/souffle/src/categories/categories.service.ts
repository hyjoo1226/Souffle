import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In } from 'typeorm';
import { Category } from './entities/category.entity';
import { Problem } from 'src/problems/entities/problem.entity';
import { UserService } from 'src/users/users.service';
import { UserProblem } from 'src/users/entities/user-problem.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Problem)
    private problemRepository: Repository<Problem>,
    @InjectRepository(UserProblem)
    private userProblemRepository: Repository<UserProblem>,
    private usersService: UserService,
  ) {}
  // 전체 단원 조회 API
  async getCategoryTree() {
    // 1. 최상위 카테고리 조회
    const roots = await this.categoryRepository.find({
      where: { parent: IsNull() },
      relations: ['children', 'children.children'],
    });

    // 2. 재귀적으로 children을 붙여 트리 구조 생성
    const buildTree = (nodes) =>
      nodes.map((node) => ({
        id: node.id,
        name: node.name,
        type: node.type,
        // progress_rate: node.progressRate,
        children: node.children ? buildTree(node.children) : [],
      }));

    return buildTree(roots);
  }
  // 단원의 모든 상위 단원 조회 API
  async getAncestors(categoryId: number) {
    // 현재 단원 조회
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
      relations: ['parent'],
    });

    if (!category) throw new NotFoundException('단원을 찾을 수 없습니다.');

    // 상위 단원들 재귀적으로 조회
    const ancestors: { id: number; name: string; type: number }[] = [];
    let parent: Category | undefined = category.parent;

    while (parent) {
      ancestors.push({
        id: parent.id,
        name: parent.name,
        type: parent.type,
      });

      // 다음 상위 단원으로 이동
      parent = await this.categoryRepository
        .findOne({
          where: { id: parent.id },
          relations: ['parent'],
        })
        .then((cat) => cat?.parent);
    }

    return {
      current: { id: category.id, name: category.name, type: category.type },
      ancestors,
    };
  }

  // 단원 상세 조회 API
  async getCategoryDetail(categoryId: number, userId: number) {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) throw new NotFoundException('단원을 찾을 수 없습니다.');

    // 재귀 CTE로 하위 모든 단원 ID 조회
    const queryRunner =
      this.problemRepository.manager.connection.createQueryRunner();
    const categoryIds = await queryRunner.query(
      `
    WITH RECURSIVE subcategories AS (
      SELECT id FROM categories WHERE id = $1
      UNION ALL
      SELECT c.id FROM categories c
      INNER JOIN subcategories s ON c."parentId" = s.id
    )
    SELECT id FROM subcategories
  `,
      [categoryId],
    );
    await queryRunner.release();

    // 하위 모든 단원에 속한 문제 조회
    const problems = await this.problemRepository.find({
      where: { category: { id: In(categoryIds.map((c) => c.id)) } },
    });

    // 문제별 통계
    const problemStats = await Promise.all(
      problems.map(async (problem) => {
        const stats = await this.userProblemRepository.findOne({
          where: {
            user_id: userId,
            problem_id: problem.id,
          },
        });

        return {
          problem_id: problem.id,
          inner_no: problem.innerNo,
          type: problem.type,
          problem_avg_accuracy: problem.avgAccuracy,
          try_count: stats?.try_count || 0,
          correct_count: stats?.correct_count || 0,
        };
      }),
    );

    // 유저 통계
    const userStats = await this.usersService.getUserCategoryStats(
      userId,
      categoryId,
    );

    return {
      category_id: category.id,
      avg_accuracy: category.avgAccuracy,
      learning_content: category.learningContent,
      concept_explanation: category.conceptExplanation,
      user: userStats,
      problem: problemStats,
    };
  }
}
