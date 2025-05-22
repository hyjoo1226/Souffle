import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ConceptQuiz } from './concept-quiz.entity';

@Entity('concept_quiz_submission')
export class ConceptQuizSubmission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.conceptQuizSubmissions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'concept_quiz_id' })
  conceptQuizId: number;

  @ManyToOne(() => ConceptQuiz, (quiz) => quiz.submissions)
  @JoinColumn({ name: 'concept_quiz_id' })
  conceptQuiz: ConceptQuiz;

  @Column()
  isCorrect: boolean;

  @Column({ type: 'jsonb' })
  answers: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
