import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FileService {
  async uploadFile(
    file: Express.Multer.File,
    userId: number,
    problemId: number,
    submissionId: number,
  ): Promise<string> {
    // 폴더 경로
    const dir = path.join(
      'uploads',
      problemId.toString(),
      userId.toString(),
      submissionId.toString(),
    );
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    // 파일 저장 로직 (S3, 로컬 등) - 현재는 로컬
    const filename = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, file.buffer);

    return `http://localhost:4000/uploads/${problemId}/${userId}/${submissionId}/${filename}`;
  }
}
