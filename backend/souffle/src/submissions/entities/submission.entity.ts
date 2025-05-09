import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Problem } from 'src/problems/entities/problem.entity';
import { SubmissionStep } from './submission-step.entity';

@Entity({ name: 'submissions' })
@Index('IDX_SUBMISSION_PROBLEM', ['problemId'])
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

  @Column()
  problemId: number;

  @Column({ type: 'int', nullable: true })
  totalSolveTime: number;

  @Column({ type: 'int', nullable: true })
  understandTime: number;

  @Column({ type: 'int', nullable: true })
  solveTime: number;

  @Column({ type: 'int', nullable: true })
  reviewTime: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  answerImageUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fullStepImageUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  answerConvert: string;

  @Column({ type: 'boolean', nullable: true })
  isCorrect: boolean | null;

  @Column({ type: 'text', nullable: true })
  aiAnalysis: string;

  @Column({ type: 'text', nullable: true })
  weakness: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  engineUsed: string;

  @Column({ type: 'boolean', nullable: true, default: null })
  analysisFailed: boolean | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @OneToMany(
    () => SubmissionStep,
    (submissionStep) => submissionStep.submission,
  )
  submissionSteps: SubmissionStep[];
}
