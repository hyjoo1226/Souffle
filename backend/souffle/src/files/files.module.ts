import { Module } from '@nestjs/common';
import { FileService } from './files.service';
import { FileController } from './files.controller';
// import { ConfigModule } from '@nestjs/config';

@Module({
  // imports: [ConfigModule],
  providers: [FileService],
  controllers: [FileController],
  exports: [FileService],
})
export class FileModule {}
