import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { Problem } from 'src/problems/problem.entity';
import { SubmissionStep } from './submission_step.entity';

@Entity({ name: 'submissions' })
export class Submission extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @ManyToOne(() => User, (user) => user.submissions, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Problem, (problem) => problem.submissions, {
    nullable: false,
  })
  @JoinColumn({ name: 'problemId' })
  problem: Problem;

  @Column({ type: 'int', default: 0 })
  totalSolveTime: number;

  @Column({ type: 'int', default: 0 })
  understandTime: number;

  @Column({ type: 'int', default: 0 })
  solveTime: number;

  @Column({ type: 'int', default: 0 })
  reviewTime: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  answerImageUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  answerConvert: string;

  @Column({ type: 'boolean', nullable: true })
  isCorrect: boolean;

  @Column({ type: 'text', nullable: true })
  aiAnalysis: string;

  @Column({ type: 'text', nullable: true })
  weakness: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @OneToMany(
    () => SubmissionStep,
    (submissionStep) => submissionStep.submission,
  )
  submissionSteps: SubmissionStep[];
}
