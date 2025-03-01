/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Multer } from 'multer';
import { CreateLeagueDto } from './dto/create-league.dto';
import { UpdateLeagueDto } from './dto/update-league.dto';

import { Competition } from 'src/competitions/entities/competition.entity';
import { User } from 'src/users/entities/user.entity';
import { League } from './entities/league.entity';

@Injectable()
export class LeaguesService {
  constructor(
    @InjectRepository(Competition)
    private readonly competitionRepository: Repository<Competition>,
    @InjectRepository(League)
    private readonly leagueRepository: Repository<League>,
  ) {}

  async create(
    createLeagueDto: CreateLeagueDto,
    user: User,
    file?: Multer.File,
  ) {
    let imageUrl: string;

    const competition = await this.competitionRepository.findOne({
      where: { id: createLeagueDto.competitionId },
    });

    if (!competition) {
      throw new NotFoundException('Compétition introuvable.');
    }

    if (file) {
      imageUrl = `https://awards-bets.fr/uploads/${file.filename}`;
    } else if (createLeagueDto.logo) {
      imageUrl = createLeagueDto.logo;
    } else {
      imageUrl = '';
    }

    const league = this.leagueRepository.create({
      ...createLeagueDto,
      user,
      competition,
      logo: imageUrl,
    });
    await this.leagueRepository.save(league);

    return {
      message: 'Ligue créée avec succès.',
      league,
    };
  }

  findAll() {
    return this.leagueRepository.find();
  }

  findOne(id: number) {
    return this.leagueRepository.findOne({ where: { id } });
  }

  findAllByUser(userId: string) {
    return this.leagueRepository.find({
      where: { user: { id: +userId } },
      relations: ['competition', 'members'],
    });
  }

  async update(id: number, updateLeagueDto: UpdateLeagueDto) {
    const league = await this.leagueRepository.findOne({
      where: { id: updateLeagueDto.id },
    });

    if (!league) {
      throw new NotFoundException('Ligue introuvable.');
    }

    return `This action updates a #${id} league`;
  }

  async remove(id: number, user: User) {
    const league = await this.leagueRepository.findOne({
      where: { id },
    });

    if (!league) {
      throw new NotFoundException('Ligue introuvable.');
    }

    if (user.id !== league.user.id) {
      throw new ForbiddenException("Cette ligue n'est pas liée à votre compte");
    }

    return `This action removes a #${id} league`;
  }
}
