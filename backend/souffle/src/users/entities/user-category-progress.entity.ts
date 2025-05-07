import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Category } from 'src/categories/entities/category.entity';

@Entity({ name: 'user_category_progresses' })
export class UserCategoryProgress extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @ManyToOne(() => User, (user) => user.progresses, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Category, (category) => category.userProgresses, {
    nullable: false,
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  categoryId: number;

  @Column({ type: 'int', default: 0 })
  solveTime: number;

  @Column({ type: 'float', nullable: true })
  progressRate: number;

  @Column({ type: 'float', nullable: true })
  testAccuracy: number;

  @Column({ type: 'int', nullable: true })
  understanding: number;

  @Column({ type: 'float', nullable: true })
  conceptRate: number;
}
