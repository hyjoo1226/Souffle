import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Problem } from 'src/problems/problem.entity';
import { UserCategoryProgress } from 'src/users/user_category_progress.entity';

@Entity()
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  type: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
  })
  @JoinColumn({ name: 'parentId' })
  parent: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @Column({ type: 'float', nullable: true })
  avgAccuracy: number;

  @Column({ type: 'text', nullable: true })
  learningContent: string;

  @Column({ type: 'text', nullable: true })
  conceptExplanation: string;

  @OneToMany(() => Problem, (problem) => problem.category)
  problems: Problem[];

  @OneToMany(() => UserCategoryProgress, (progress) => progress.category)
  userProgresses: UserCategoryProgress[];
}
