import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  RelationId,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity({ name: 'note_folder' })
export class NoteFolder {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.notes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @RelationId((folder: NoteFolder) => folder.user)
  user_id: number;

  @Column({ type: 'int', nullable: false })
  type: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @ManyToOne(() => NoteFolder, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: NoteFolder | null;

  @RelationId((folder: NoteFolder) => folder.parent)
  parent_id: number;

  @OneToOne(() => NoteFolder, (folder) => folder.parent)
  child: NoteFolder;

  @Column({ type: 'int', nullable: true })
  sort_order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
