import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Category } from 'src/categories/entities/category.entity';

@Entity('user_problem_progress')
export class UserProblemProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  categoryId: number;

  @Column({ type: 'float', nullable: true })
  testAccuracy: number;

  @Column({ type: 'float', nullable: true })
  progressRate: number;

  @Column({ type: 'int', default: 0 })
  solveTime: number;

  @Column({ type: 'float', nullable: true })
  conceptRate: number;

  @Column({ type: 'int', nullable: true })
  understanding: number;
}
