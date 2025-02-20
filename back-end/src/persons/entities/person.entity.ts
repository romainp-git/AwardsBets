import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Nominee } from 'src/nominees/entities/nominee.entity';
import { MoviePerson } from 'src/movies/entities/movieperson.entity';

@Entity()
export class Person {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  photo: string;

  @OneToMany(() => MoviePerson, (moviePerson) => moviePerson.person, { cascade: true })
  movies: MoviePerson[];

  // ✅ Date de création (ajoutée automatiquement)
  @CreateDateColumn()
  createdAt: Date;

  // ✅ Date de dernière mise à jour (mise à jour automatique)
  @UpdateDateColumn()
  updatedAt: Date;
}