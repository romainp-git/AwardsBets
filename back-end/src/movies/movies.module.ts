import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { MoviePerson } from './entities/movieperson.entity';
import { Person } from '../persons/entities/person.entity';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { TmdbService } from '../tmdb/tmdb.service'; // ✅ Import du service TMDB

@Module({
  imports: [TypeOrmModule.forFeature([Movie, MoviePerson, Person])],
  controllers: [MoviesController],
  providers: [MoviesService, TmdbService],
  exports: [MoviesService],
})
export class MoviesModule {}
