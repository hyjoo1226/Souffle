import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Problem } from 'src/problems/problem.entity';

@Entity({ name: 'books' })
export class Book extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  publisher: string;

  @Column({ type: 'int', nullable: true })
  year: number;

  @OneToMany(() => Problem, (problem) => problem.book)
  problems: Problem[];
}
