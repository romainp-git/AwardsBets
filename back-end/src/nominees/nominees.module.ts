import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nominee } from './entities/nominee.entity';
import { NomineesController } from './nominees.controller';
import { NomineesService } from './nominees.service';
import { AuthModule } from 'src/auth/auth.module';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Category } from 'src/categories/entities/category.entity';
import { Vote } from 'src/votes/entities/vote.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ Nominee, Category, Vote, User]),
    AuthModule,
  ],
  controllers: [NomineesController],
  providers: [NomineesService, JwtAuthGuard], 
  exports: [NomineesService],
})

export class NomineesModule {}