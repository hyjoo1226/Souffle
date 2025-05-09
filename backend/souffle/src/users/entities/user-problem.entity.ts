import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Problem } from 'src/problems/entities/problem.entity';

@Entity()
@Index(['user', 'problem'], { unique: true })
export class UserProblem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userProblems)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Problem, (problem) => problem.userProblems)
  @JoinColumn({ name: 'problem_id' })
  problem: Problem;

  @Column({ nullable: true })
  wrong_note_folder_id: number;

  @Column({ nullable: true })
  favorite_folder_id: number;

  @Column({ default: 0 })
  try_count: number;

  @Column({ default: 0 })
  correct_count: number;

  @Column({ nullable: true })
  last_submission_id: number;
}
