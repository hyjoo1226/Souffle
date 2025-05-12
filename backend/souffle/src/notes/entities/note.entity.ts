import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity({ name: 'note' })
export class Note {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.notes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', nullable: false })
  type: number; // 1: 오답노트, 2: 즐겨찾기

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @ManyToOne(() => Note, (note) => note.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Note;

  @OneToMany(() => Note, (note) => note.parent)
  children: Note[];

  @Column({ type: 'int', nullable: true })
  sort_order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
