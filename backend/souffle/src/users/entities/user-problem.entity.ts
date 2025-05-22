import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Problem } from 'src/problems/entities/problem.entity';
import { NoteContent } from 'src/notes/entities/note-content.entity';

@Entity()
@Index(['user', 'problem'], { unique: true })
export class UserProblem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userProblems)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Problem, (problem) => problem.userProblems)
  @JoinColumn({ name: 'problem_id' })
  problem: Problem;

  @Column({ type: 'integer', nullable: true })
  wrong_note_folder_id: number | null;

  @Column({ type: 'integer', nullable: true })
  favorite_folder_id: number | null;

  @Column({ default: 0 })
  try_count: number;

  @Column({ default: 0 })
  correct_count: number;

  @Column({ nullable: true })
  last_submission_id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => NoteContent, (noteContent) => noteContent.user_problem)
  noteContents: NoteContent[];
}
