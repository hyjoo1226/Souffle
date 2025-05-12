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
}
