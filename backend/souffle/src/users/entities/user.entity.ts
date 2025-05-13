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
<<<<<<< HEAD
import { NoteFolder } from 'src/notes/entities/note-folder.entity';
=======
import { UserAuthentication } from './user-authentication.entity';
>>>>>>> 96c7442b9f0cfa248360181edf75b8cb0737835f

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  nickname: string;

<<<<<<< HEAD
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
=======
  @Column({ type: 'varchar', length: 255, nullable: true })
  profileImage: string;
>>>>>>> 96c7442b9f0cfa248360181edf75b8cb0737835f

  @OneToMany(() => Submission, (submission) => submission.user)
  submissions: Submission[];

  @OneToMany(() => UserCategoryProgress, (progress) => progress.user)
  progresses: UserCategoryProgress[];

  @OneToMany(() => UserProblem, (userProblem) => userProblem.user)
  userProblems: UserProblem[];

<<<<<<< HEAD
  @OneToMany(() => NoteFolder, (noteFolder) => noteFolder.user)
  notes: NoteFolder[];
=======
  @OneToMany(() => UserAuthentication, (auth) => auth.user)
  authentications: UserAuthentication[];
>>>>>>> 96c7442b9f0cfa248360181edf75b8cb0737835f
}
