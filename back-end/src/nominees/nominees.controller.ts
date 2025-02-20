import { Controller, Param, Delete, Get, Body, Post, UnauthorizedException, UseGuards, Patch } from '@nestjs/common';
import { NomineesService } from './nominees.service';
import { Nominee } from './entities/nominee.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 
import { CurrentUser } from '../auth/current-user.decorator'; 
import { VoteDto } from './dto/vote.dto';
import { UpdateOddsDto } from './dto/update-odds.dto';

@Controller('nominees')
export class NomineesController {
    constructor(
        private readonly nomineesService: NomineesService
    ) {}

    @Get(':id')
    async getNominee(@Param('id') id: number): Promise<Nominee> {
        return this.nomineesService.findOne(id);
    }

    @Get()
    async findAll(){
        return this.nomineesService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/vote')
    async voteForNominee(
        @Param('id') nomineeId: number,
        @CurrentUser() user,
        @Body() voteDto: VoteDto
    ) {
        if (!user) {
            throw new UnauthorizedException('Utilisateur non authentifié');
        }

        const updatedVoteDto = { ...voteDto, nomineeId };
        return this.nomineesService.voteForNominee(user, updatedVoteDto);
    }

    @Patch(':id/odds')
    async updateOdds(
        @Param('id') id: number,
        @Body() updateOddsDto: UpdateOddsDto
    ) {
        return this.nomineesService.updateOdds(id, updateOddsDto);
    }

    @Patch(':id/set-winner')
    async setWinner( 
        @Param('id') nomineeId: number,
    ) {
        console.log("📌 setWinner appelé pour le nominee ID:", nomineeId);
        return this.nomineesService.setWinner(nomineeId);
    }

    @Patch("/reset-winners")
    async resetAllWinners() {
        return this.nomineesService.resetAllWinners();
    }

    @Delete(':id')
    async deleteNominee(
        @Param('id') nomineeId: number
    ) {
        return this.nomineesService.deleteNominee(nomineeId);
    }
}