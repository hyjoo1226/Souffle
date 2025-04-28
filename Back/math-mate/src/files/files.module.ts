import { Module } from '@nestjs/common';
import { FileService } from './files.service';
import { FileController } from './files.controller';

@Module({
  providers: [FileService],
  controllers: [FileController],
  exports: [FileService],
})
export class FilesModule {}
