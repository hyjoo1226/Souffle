import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Submission extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'int' })
  problemId: number;

  @Column({ type: 'int' })
  solveTime: number;

  @Column({ type: 'varchar', length: 255 })
  answerImageUrl: string;

  @Column({ type: 'varchar', length: 255 })
  answerConvert: string;

  @Column({ type: 'boolean' })
  isCorrect: boolean;

  @Column({ type: 'text' })
  aiAnalysis: string;

  @Column({ type: 'text' })
  weakness: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
