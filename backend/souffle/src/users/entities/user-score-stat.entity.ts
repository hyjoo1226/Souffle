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

@Entity('user_score_stat')
export class UserScoreStat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.scoreStats)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'float', nullable: true })
  correctScore: number;

  @Column({ type: 'float', nullable: true })
  participationScore: number;

  @Column({ type: 'float', nullable: true })
  speedScore: number;

  @Column({ type: 'float', nullable: true })
  reviewScore: number;

  @Column({ type: 'float', nullable: true })
  sincerityScore: number;

  @Column({ type: 'float', nullable: true })
  reflectionScore: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
