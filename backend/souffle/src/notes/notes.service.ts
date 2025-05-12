import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoteFolder } from './entities/note-folder.entity';
import { CreateNoteFolderDto } from './dto/create-note-folder.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(NoteFolder)
    private noteFolderRepository: Repository<NoteFolder>,
  ) {}

  // 오답노트 폴더 조회 API
  async getNoteFolderTree(userId: number, type?: number) {
    const folders = await this.noteFolderRepository.find({
      where: { user: { id: userId }, ...(type && { type }) },
    });
    const folderMap = new Map<number, any>();
    folders.forEach((f) =>
      folderMap.set(f.id, {
        id: f.id,
        name: f.name,
        type: f.type,
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

    // 저장 및 반환
    return this.noteFolderRepository.save(newFolder);
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

    // 쿼리 빌더 준비
    const queryBuilder = this.noteFolderRepository.createQueryBuilder();

    // 같은 유저의 같은 부모 아래의 폴더들만 조정
    queryBuilder.where('user_id = :userId', { userId: folder.user_id });

    // 부모 ID 조건 추가 (null 고려)
    if (folder.parent_id === null) {
      queryBuilder.andWhere('parent_id IS NULL');
    } else {
      queryBuilder.andWhere('parent_id = :parentId', {
        parentId: folder.parent_id,
      });
    }

    // 폴더를 위로 이동 (더 작은 순서 번호로)
    if (newOrder < originalOrder) {
      // newOrder ~ originalOrder-1 범위의 폴더들 순서 1씩 증가
      await queryBuilder
        .update(NoteFolder)
        .set({ sort_order: () => 'sort_order + 1' })
        .andWhere('sort_order >= :newOrder', { newOrder })
        .andWhere('sort_order < :originalOrder', { originalOrder })
        .execute();
    }
    // 폴더를 아래로 이동 (더 큰 순서 번호로)
    else {
      // originalOrder+1 ~ newOrder 범위의 폴더들 순서 1씩 감소
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
}
