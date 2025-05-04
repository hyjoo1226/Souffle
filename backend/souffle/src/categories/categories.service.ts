import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
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
}
