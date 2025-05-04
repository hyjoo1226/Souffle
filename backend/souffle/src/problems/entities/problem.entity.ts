import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Submission } from 'src/submissions/entities/submission.entity';
import { Category } from 'src/categories/category.entity';
import { Book } from 'src/books/entities/book.entity';

@Entity({ name: 'problems' })
export class Problem extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Category, (category) => category.problems, {
    nullable: false,
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ManyToOne(() => Book, (book) => book.problems, { nullable: false })
  @JoinColumn({ name: 'bookId' })
  book: Book;

  @Column({ type: 'varchar', length: 50, nullable: true })
  problemNo: string;

  @Column({ type: 'int', nullable: false })
  innerNo: number;

  @Column({ type: 'int', nullable: false })
  type: number;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ type: 'json', nullable: true })
  choice: object;

  @Column({ type: 'varchar', length: 255, nullable: true })
  problemImageUrl: string;

  @Column({ type: 'varchar', length: 255 })
  answer: string;

  @Column({ type: 'text' })
  explanation: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  explanationImageUrl: string;

  @Column({ type: 'float', nullable: true })
  avgAccuracy: number;

  @Column({ type: 'int', nullable: true })
  avgTotalSolveTime: number;

  @Column({ type: 'int', nullable: true })
  avgUnderstandTime: number;

  @Column({ type: 'int', nullable: true })
  avgSolveTime: number;

  @Column({ type: 'int', nullable: true })
  avgReviewTime: number;

  @OneToMany(() => Submission, (submission) => submission.problem)
  submissions: Submission[];
}
