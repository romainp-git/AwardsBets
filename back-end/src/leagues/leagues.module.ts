import { Module } from '@nestjs/common';
import { LeaguesService } from './leagues.service';
import { LeaguesController } from './leagues.controller';
import { Competition } from 'src/competitions/entities/competition.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/users/entities/user.entity';
import { League } from './entities/league.entity';
import { AuthGuard } from 'src/auth/Guards/auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Competition, User, League]), AuthModule],
  controllers: [LeaguesController],
  providers: [LeaguesService, AuthGuard],
  exports: [LeaguesService],
})
export class LeaguesModule {}
