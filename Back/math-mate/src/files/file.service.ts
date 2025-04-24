import { Injectable } from '@nestjs/common';

@Injectable()
export class FileService {
  async uploadFile(file: Express.Multer.File): Promise<string> {
    // 파일 저장 로직 (S3, 로컬 등)
    // 예시: return 저장된 파일의 URL;
    return `https://your-storage.com/${file.originalname}`;
  }
}
