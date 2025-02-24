import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Movie } from 'src/movies/entities/movie.entity';
import { User } from 'src/users/entities/user.entity';

import { List } from './entities/list.entity';
import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';
import { AuthModule } from 'src/auth/auth.module';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, User, List]), AuthModule],
  controllers: [ListsController],
  providers: [ListsService, JwtAuthGuard],
  exports: [ListsService],
})
export class ListsModule {}
