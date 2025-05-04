import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

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
}
