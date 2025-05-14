import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Problem } from 'src/problems/entities/problem.entity';
import { UserCategoryProgress } from 'src/users/entities/user-category-progress.entity';
import { Concept } from 'src/concepts/entities/concept.entity';

@Entity({ name: 'categories' })
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  type: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
  })
  @JoinColumn({ name: 'parentId' })
  parent: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @Column({ type: 'float', nullable: true })
  avgAccuracy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Problem, (problem) => problem.category)
  problems: Problem[];

  @OneToMany(() => UserCategoryProgress, (progress) => progress.category)
  userProgresses: UserCategoryProgress[];

  @OneToMany(() => Concept, (concept) => concept.category)
  concepts: Concept[];
}
