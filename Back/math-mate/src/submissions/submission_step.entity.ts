import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Submission } from './submission.entity';

@Entity()
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

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @Column({ type: 'varchar', length: 255 })
  stepImageUrl: string;

  @Column({ type: 'boolean', nullable: true })
  isValid: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
