import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Competition } from './entities/competition.entity';
import { Category } from '../categories/entities/category.entity';
import { CompetitionsService } from './competitions.service';
import { CompetitionsController } from './competitions.controller';
import { Nominee } from 'src/nominees/entities/nominee.entity';
import { Movie } from 'src/movies/entities/movie.entity';
import { Person } from 'src/persons/entities/person.entity';
import { MoviePerson } from 'src/movies/entities/movieperson.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Competition, Category, Nominee, Movie, Person, MoviePerson])],
  controllers: [CompetitionsController],
  providers: [CompetitionsService], 
  exports: [CompetitionsService],
})

export class CompetitionsModule {}