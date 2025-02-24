import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinTable,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Movie } from 'src/movies/entities/movie.entity';
import { Person } from 'src/persons/entities/person.entity';
import { Nominee } from 'src/nominees/entities/nominee.entity';

@Entity()
export class MoviePerson {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Movie, (movie) => movie.team, { onDelete: 'CASCADE' })
  movie: Movie;

  @ManyToOne(() => Person, (person) => person.movies, { onDelete: 'CASCADE' })
  person: Person;

  @ManyToMany(() => Nominee, (nomination) => nomination.team)
  @JoinTable()
  nominations: Nominee[];

  @Column('text', { array: true })
  roles: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
