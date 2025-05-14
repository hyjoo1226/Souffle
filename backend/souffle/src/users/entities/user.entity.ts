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
import { UserAuthentication } from './user-authentication.entity';
import { UserScoreStat } from './user-score-stat.entity';
import { UserReport } from './user-report.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  nickname: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profileImage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Submission, (submission) => submission.user)
  submissions: Submission[];

  @OneToMany(() => UserCategoryProgress, (progress) => progress.user)
  progresses: UserCategoryProgress[];

  @OneToMany(() => UserProblem, (userProblem) => userProblem.user)
  userProblems: UserProblem[];

  @OneToMany(() => NoteFolder, (noteFolder) => noteFolder.user)
  notes: NoteFolder[];

  @OneToMany(() => UserAuthentication, (auth) => auth.user)
  authentications: UserAuthentication[];

  @OneToMany(() => UserScoreStat, (scoreStat) => scoreStat.user)
  scoreStats: UserScoreStat[];

  @OneToMany(() => UserReport, (report) => report.user)
  reports: UserReport[];
}
