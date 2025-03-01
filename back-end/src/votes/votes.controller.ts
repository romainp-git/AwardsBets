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
import { AuthGuard } from 'src/auth/Guards/auth.guard';

@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Get()
  findAll() {
    return this.votesService.findAll();
  }

  @Get('user')
  @UseGuards(AuthGuard)
  async getVotesByUser(@CurrentUser() user: User) {
    console.log('le user est', user);
    return this.votesService.findByUser(user);
  }

  @Post('batch')
  @UseGuards(AuthGuard)
  async voteBatch(@Body() votes: VoteDto[], @CurrentUser() user) {
    const formatedVotes: VoteDto[] = Object.values(votes).flat();
    await this.votesService.voteBatch(user as User, formatedVotes);
    return { message: 'Votes enregistrés et odds mis à jour' };
  }

  @Delete(':id')
  async remove(@Param('id') voteId: number) {
    return this.votesService.remove(voteId);
  }
}
