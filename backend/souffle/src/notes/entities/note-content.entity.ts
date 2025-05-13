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

  @Column('jsonb')
  solution_strokes: Array<Array<{ x: number; y: number }>>;

  @Column('jsonb')
  concept_strokes: Array<Array<{ x: number; y: number }>>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
