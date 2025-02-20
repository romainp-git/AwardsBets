import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Competition } from '../../competitions/entities/competition.entity';
import { Movie } from 'src/movies/entities/movie.entity';
import { Category } from 'src/categories/entities/category.entity';
import { MoviePerson } from 'src/movies/entities/movieperson.entity';
import { Vote } from 'src/votes/entities/vote.entity';

@Entity()
export class Nominee {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => MoviePerson, (mp) => mp.nominations )
  @JoinTable()
  team: MoviePerson[];

  @ManyToOne(() => Movie, (movie) => movie.nominations, { onDelete: 'CASCADE' })
  movie: Movie;

  @ManyToOne(() => Category, (category) => category.nominees, { onDelete: 'CASCADE' })
  category: Category;

  @ManyToOne(() => Competition, (competition) => competition.nominees, { onDelete: 'CASCADE' })
  competition: Competition;

  @Column({ nullable: true })
  song?: string;

  @Column({ default: false })
  winner: boolean;

  @OneToMany(() => Vote, (vote) => vote.nominee, { cascade: true })
  votes: Vote[];

  @Column({ type: 'float', default: 2 })
  prevWinnerOdds: number;

  @Column({ type: 'float', default: 2 })
  currWinnerOdds: number;

  @Column({ type: 'float', default: 2 })
  prevLoserOdds: number;

  @Column({ type: 'float', default: 2 })
  currLoserOdds: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}