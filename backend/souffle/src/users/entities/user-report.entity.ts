import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_report')
export class UserReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.reports)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  aiDiagnosis: string;

  @Column({ type: 'jsonb' })
  studyPlan: {
    methods: Array<{ step: number; content: string }>;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
