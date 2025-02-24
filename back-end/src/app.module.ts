import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { MoviesModule } from './movies/movies.module';
import { PersonsModule } from './persons/persons.module';
import { CompetitionsModule } from './competitions/competitions.module';
import { CategoriesModule } from './categories/categories.module';
import { NomineesModule } from './nominees/nominees.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { VotesModule } from './votes/votes.module';

import { TmdbService } from './tmdb/tmdb.service';
import { ListsModule } from './lists/lists.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    CategoriesModule,
    CompetitionsModule,
    ListsModule,
    MoviesModule,
    NomineesModule,
    PersonsModule,
    UsersModule,
    AuthModule,
    VotesModule,
  ],
  providers: [TmdbService],
})
export class AppModule {}
