import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Submission } from './submission.entity';

@Entity({ name: 'submission_steps' })
export class SubmissionStep extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Submission, (submission) => submission.submissionSteps, {
    nullable: false,
  })
  @JoinColumn({ name: 'submissionId' })
  submission: Submission;

  @Column({ type: 'int' })
  stepNumber: number;

  @Column({ type: 'int', nullable: true })
  stepTime: number;

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @Column({ type: 'varchar', length: 255 })
  stepImageUrl: string;

  @Column({ type: 'boolean', nullable: true })
  isValid: boolean;

  @Column({ type: 'text', nullable: true })
  latex: string;

  @Column({ type: 'text', nullable: true })
  currentLatex: string;

  @Column({ type: 'text', nullable: true })
  stepFeedback: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
