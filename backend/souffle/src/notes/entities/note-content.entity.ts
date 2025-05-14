import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { UserProblem } from 'src/users/entities/user-problem.entity';

@Entity({ name: 'note_content' })
export class NoteContent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserProblem, (userProblem) => userProblem.noteContents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_problem_id' })
  user_problem: UserProblem;

  @Column({ type: 'jsonb', nullable: true })
  solution_strokes: Array<Array<{ x: number; y: number }>>;

  @Column({ type: 'jsonb', nullable: true })
  concept_strokes: Array<Array<{ x: number; y: number }>>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
