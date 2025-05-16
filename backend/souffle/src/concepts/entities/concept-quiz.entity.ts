import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Concept } from './concept.entity';
import { ConceptQuizBlank } from './concept-quiz-blank.entity';
import { ConceptQuizSubmission } from './concept-quiz-submission.entity';

@Entity('concept_quiz')
export class ConceptQuiz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'concept_id' })
  conceptId: number;

  @ManyToOne(() => Concept, (concept) => concept.quizzes)
  @JoinColumn({ name: 'concept_id' })
  concept: Concept;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  order: number;

  @OneToMany(() => ConceptQuizBlank, (blank) => blank.conceptQuiz)
  blanks: ConceptQuizBlank[];

  @OneToMany(
    () => ConceptQuizSubmission,
    (submission) => submission.conceptQuiz,
  )
  submissions: ConceptQuizSubmission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
