import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Nominee } from 'src/nominees/entities/nominee.entity';
import { MoviePerson } from './movieperson.entity';
import { List } from 'src/lists/entities/list.entity';

@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'float', nullable: true })
  rating: number;

  @Column({ type: 'date', nullable: true }) 
  releaseDate: Date;

  @Column({ nullable: true })
  backdrop: string;

  @Column({ nullable: true })
  poster: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true, type: 'text' })
  synopsis: string;

  @Column({ nullable: true, type: 'text' })
  genres: string;

  @Column({ nullable: true })
  duration: number;

  @Column({ nullable: true })
  tmdbId: string;

  @OneToMany(() => MoviePerson, (moviePerson) => moviePerson.movie, { cascade: true, onDelete: 'CASCADE' })
  team: MoviePerson[];

  @OneToMany(() => Nominee, (nominations) => nominations.category, { cascade: true, onDelete: 'CASCADE' })
  nominations: Nominee[];

  @OneToMany(() => List, (list) => list.movie)
  lists: List[];

  // ✅ Date de création (ajoutée automatiquement)
  @CreateDateColumn()
  createdAt: Date;

  // ✅ Date de dernière mise à jour (mise à jour automatique)
  @UpdateDateColumn()
  updatedAt: Date;
}