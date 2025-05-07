import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class UserProblem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  problem_id: number;

  @Column({ nullable: true })
  wrong_note_folder_id: number;

  @Column({ nullable: true })
  favorite_folder_id: number;

  @Column({ default: 0 })
  try_count: number;

  @Column({ default: 0 })
  correct_count: number;

  @Column({ nullable: true })
  last_submission_id: number;
}
