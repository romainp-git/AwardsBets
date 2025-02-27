import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vote } from './entities/vote.entity';
import { VotesController } from './votes.controller';
import { VotesService } from './votes.service';
import { Nominee } from 'src/nominees/entities/nominee.entity';
import { Category } from 'src/categories/entities/category.entity';
import { AuthModule } from 'src/auth/auth.module';
import { AuthGuard } from 'src/auth/Guards/auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Vote, Nominee, Category]), AuthModule],
  controllers: [VotesController],
  providers: [VotesService, AuthGuard],
  exports: [VotesService],
})
export class VotesModule {}
