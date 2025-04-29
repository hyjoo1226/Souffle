import { Module } from '@nestjs/common';
import { BookController } from './books.controller';
import { BookService } from './books.service';

@Module({
  controllers: [BookController],
  providers: [BookService],
})
export class BookModule {}
