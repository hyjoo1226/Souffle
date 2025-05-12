import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Submission } from 'src/submissions/entities/submission.entity';
import { UserCategoryProgress } from './user-category-progress.entity';
import { UserProblem } from './user-problem.entity';
import { NoteFolder } from 'src/notes/entities/note-folder.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  nickname: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Submission, (submission) => submission.user)
  submissions: Submission[];

  @OneToMany(() => UserCategoryProgress, (progress) => progress.user)
  progresses: UserCategoryProgress[];

  @OneToMany(() => UserProblem, (userProblem) => userProblem.user)
  userProblems: UserProblem[];

  @OneToMany(() => NoteFolder, (note) => note.user)
  notes: NoteFolder[];
}
