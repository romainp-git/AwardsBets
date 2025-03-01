import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Nominee } from 'src/nominees/entities/nominee.entity';
import { League } from 'src/leagues/entities/league.entity';

@Entity()
export class Competition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  edition: string;

  @Column({ type: 'date' })
  date: Date;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column()
  venue: string;

  @Column()
  city: string;

  @Column()
  country: string;

  @OneToMany(() => Category, (category) => category.competition, {
    cascade: true,
  })
  categories: Category[];

  @OneToMany(() => Nominee, (nominee) => nominee.competition, { cascade: true })
  nominees: Nominee[];

  @OneToMany(() => League, (league) => league.competition, { cascade: true })
  leagues: League[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
