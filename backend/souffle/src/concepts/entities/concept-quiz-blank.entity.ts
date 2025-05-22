import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ConceptQuiz } from './concept-quiz.entity';

@Entity('concept_quiz_blank')
export class ConceptQuizBlank {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'concept_quiz_id' })
  conceptQuizId: number;

  @ManyToOne(() => ConceptQuiz, (quiz) => quiz.blanks)
  @JoinColumn({ name: 'concept_quiz_id' })
  conceptQuiz: ConceptQuiz;

  @Column()
  blankIndex: number;

  @Column()
  answerIndex: number;

  @Column({ type: 'json' })
  choice: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
