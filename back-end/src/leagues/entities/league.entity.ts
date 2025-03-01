import { Competition } from 'src/competitions/entities/competition.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  JoinTable,
  ManyToMany,
} from 'typeorm';

export enum LeagueType {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

@Entity()
export class League {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToOne(() => User, (user) => user.votes, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Competition, (competition) => competition.leagues, {
    onDelete: 'CASCADE',
  })
  competition: Competition;

  @ManyToMany(() => User, (user) => user.leagues)
  @JoinTable()
  members: User[];

  @Column({ nullable: true })
  logo?: string;

  @Column({ type: 'enum', enum: LeagueType, default: LeagueType.PUBLIC })
  status: LeagueType;

  @Column({ nullable: true })
  citation?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
