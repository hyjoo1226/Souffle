import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Submission extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  categoryId: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  problemNo: string;

  @Column({ type: 'int', nullable: false })
  innerNo: number;

  @Column({ type: 'int', nullable: false })
  type: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  source: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ type: 'json', nullable: true })
  choice: object;

  @Column({ type: 'varchar', length: 255, nullable: true })
  problemImageUrl: string;

  @Column({ type: 'varchar', length: 255 })
  answer: string;

  @Column({ type: 'text' })
  explanation: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  explanationImageUrl: string;

  @Column({ type: 'float', nullable: true })
  avgAccuracy: number;

  @Column({ type: 'int', nullable: true })
  avgSolveTime: number;
}
