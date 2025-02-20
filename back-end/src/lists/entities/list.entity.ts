import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, Unique, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "src/users/entities/user.entity";
import { Movie } from "src/movies/entities/movie.entity";

export enum ListType {
  LIKED = "LIKED",
  WATCHED = "WATCHED",
  WATCHLIST = "WATCHLIST",
}

@Entity()
@Unique(["user", "movie", "type"])
export class List {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.lists, { onDelete: "CASCADE" })
    user: User;

    @ManyToOne(() => Movie, (movie) => movie.lists, { onDelete: "CASCADE" })
    movie: Movie;

    @Column({ type: "enum", enum: ListType })
    type: ListType;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}