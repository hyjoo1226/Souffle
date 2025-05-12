import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoteFolder } from './entities/note-folder.entity';

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
}
