import {
  Controller,
  Param,
  Delete,
  Body,
  Post,
  UseGuards,
  Get,
} from '@nestjs/common';
import { VotesService } from './votes.service';
import { VoteDto } from './dto/vote.dto';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Get()
  findAll() {
    return this.votesService.findAll();
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getVotesByUser(@CurrentUser() user: User) {
    console.log('le user est', user);
    return this.votesService.findByUser(user);
  }

  @Post('batch')
  @UseGuards(JwtAuthGuard)
  async voteBatch(@Body() votes: VoteDto[], @CurrentUser() user) {
    const formatedVotes: VoteDto[] = Object.values(votes).flat();
    return this.votesService.voteBatch(user as User, formatedVotes);
  }

  @Delete(':id')
  async deleteVote(@Param('id') voteId: number) {
    return this.votesService.deleteVote(voteId);
  }
}
