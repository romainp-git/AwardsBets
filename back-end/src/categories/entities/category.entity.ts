import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Competition } from '../../competitions/entities/competition.entity';
import { Nominee } from 'src/nominees/entities/nominee.entity';
import { Vote } from 'src/votes/entities/vote.entity';

export enum CategoryType {
  MOVIE = 'movie',
  ACTOR = 'actor',
  SONG = 'song',
  OTHER = 'other',
}

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: 0 })
  position: number;

  @Column({
    type: 'enum',
    enum: CategoryType,
    default: CategoryType.MOVIE,
  })
  type: CategoryType;

  @ManyToOne(() => Competition, (competition) => competition.categories, {
    onDelete: 'CASCADE',
  })
  competition: Competition;

  @OneToMany(() => Nominee, (nominee) => nominee.category, { cascade: true })
  nominees: Nominee[];

  @OneToMany(() => Vote, (vote) => vote.category, { cascade: true })
  votes: Vote[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
