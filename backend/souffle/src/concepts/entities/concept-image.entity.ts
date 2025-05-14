import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Concept } from './concept.entity';

@Entity()
export class ConceptImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'concept_id' })
  conceptId: number;

  @ManyToOne(() => Concept, (concept) => concept.images)
  @JoinColumn({ name: 'concept_id' })
  concept: Concept;

  @Column({ type: 'varchar', length: 255 })
  imageUrl: string;

  @Column({ default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
