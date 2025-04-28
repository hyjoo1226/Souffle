import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('files')
export class FileController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // 'file'은 form-data의 필드명
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    // file.path에 실제 저장 경로가 담깁니다
    return {
      originalname: file.originalname,
      filename: file.filename,
      path: file.path, // 저장된 파일의 경로
    };
  }
}
