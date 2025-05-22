import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { UserService } from 'src/users/users.service';
import { Category } from './entities/category.entity';
import { Problem } from 'src/problems/entities/problem.entity';
import { Concept } from 'src/concepts/entities/concept.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Problem)
    private problemRepository: Repository<Problem>,
    @InjectRepository(Concept)
    private conceptRepository: Repository<Concept>,
    private usersService: UserService,
  ) {}
  // 전체 단원 조회 API
  async getCategoryTree() {
    // 최상위 카테고리 조회
    const roots = await this.categoryRepository.find({
      where: { parent: IsNull() },
      relations: ['children', 'children.children'],
    });

    // 재귀적으로 children을 붙여 트리 구조 생성
    const buildTree = (nodes) =>
      nodes.map((node) => ({
        id: node.id,
        name: node.name,
        type: node.type,
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

    // 개념
    const concepts = await this.conceptRepository.find({
      where: { category: { id: categoryId } },
      relations: ['images'],
      order: { order: 'ASC' },
    });
    const formattedConcepts = concepts.map((concept) => ({
      id: concept.id,
      title: concept.title,
      description: concept.description,
      order: concept.order,
      images: concept.images
        .sort((a, b) => a.order - b.order)
        .map((image) => ({
          id: image.id,
          url: image.imageUrl,
          order: image.order,
        })),
    }));

    // 문제별 통계
    const problemsWithStats = await this.problemRepository
      .createQueryBuilder('problem')
      .leftJoinAndSelect(
        'user_problem',
        'up',
        'up.problem_id = problem.id AND up.user_id = :userId',
        { userId },
      )
      .where('problem.categoryId IN (:...categoryIds)', {
        categoryIds: categoryIds.map((c) => c.id),
      })
      .select([
        'problem.id AS problem_id',
        'problem.innerNo AS inner_no',
        'problem.type AS type',
        'problem.avgAccuracy AS problem_avg_accuracy',
        'COALESCE(up.try_count, 0) AS try_count',
        'COALESCE(up.correct_count, 0) AS correct_count',
      ])
      .getRawMany();

    // 유저 통계
    const userStats = await this.usersService.getUserCategoryStats(
      userId,
      categoryId,
    );

    return {
      category_id: category.id,
      avg_accuracy: category.avgAccuracy,
      user: userStats,
      concepts: formattedConcepts,
      problem: problemsWithStats,
    };
  }
}
