import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Competition } from './entities/competition.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Nominee } from 'src/nominees/entities/nominee.entity';

import { CreateCompetitionDto } from './dto/create-competition.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateNomineeDto } from './dto/create-nominee.dto';
import { Movie } from 'src/movies/entities/movie.entity';
import { MoviePerson } from 'src/movies/entities/movieperson.entity';

@Injectable()
export class CompetitionsService {
  constructor(
    @InjectRepository(Competition)
    private readonly competitionRepository: Repository<Competition>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(Nominee)
    private readonly nomineeRepository: Repository<Nominee>,

    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,

    @InjectRepository(MoviePerson)
    private readonly moviePersonRepository: Repository<MoviePerson>,
  ) {}

  async create(createCompetitionDto: CreateCompetitionDto) {
    const competition = this.competitionRepository.create(createCompetitionDto);
    return await this.competitionRepository.save(competition);
  }

  async findAll() {
    const competitions = await this.competitionRepository.find({
      relations: [
        'categories',
        'categories.nominees',
        'categories.votes',
        'categories.votes.nominee',
      ],
    });
    return competitions.map((comp) => ({
      ...comp,
      startTime: comp.startTime.slice(0, 5),
      endTime: comp.endTime.slice(0, 5),
    }));
  }

  async findOne(id: number): Promise<Competition> {
    const competition = await this.competitionRepository.findOne({
      where: { id },
      relations: [
        'categories',
        'categories.nominees',
        'categories.votes',
        'categories.nominees.movie',
        'categories.nominees.team',
        'categories.nominees.team.person',
        'categories.nominees.votes',
      ],
    });

    // Enrichir les personnes avec leurs rôles spécifiques au film
    if (!competition) {
      throw new NotFoundException(`Compétition avec l'ID ${id} introuvable`);
    }

    return {
      ...competition,
      startTime: competition.startTime.slice(0, 5),
      endTime: competition.endTime.slice(0, 5),
    };
  }

  async remove(id: number) {
    const competition = await this.competitionRepository.findOne({
      where: { id },
    });

    if (!competition) {
      throw new NotFoundException(`Compétition avec l'ID ${id} introuvable`);
    }

    await this.competitionRepository.delete(id);
    return { message: 'Compétition supprimée avec succès' };
  }

  async addCategory(
    competitionId: number,
    createCategoryDto: CreateCategoryDto,
  ) {
    const competition = await this.competitionRepository.findOne({
      where: { id: competitionId },
      relations: ['categories'],
    });

    if (!competition) {
      throw new NotFoundException(
        `Compétition avec l'ID ${competitionId} introuvable`,
      );
    }

    const maxPosition = competition.categories.length
      ? Math.max(...competition.categories.map((c) => c.position))
      : 0;

    const category = this.categoryRepository.create({
      ...createCategoryDto,
      competition,
      nominees: [],
      position: maxPosition + 1,
    });

    return await this.categoryRepository.save(category);
  }

  async reorderCategories(
    competitionId: number,
    categoriesOrder: { categoryId: number; position: number }[],
  ) {
    const competition = await this.competitionRepository.findOne({
      where: { id: competitionId },
      relations: ['categories'],
    });

    if (!competition) {
      throw new NotFoundException(
        `Compétition avec l'ID ${competitionId} introuvable`,
      );
    }

    for (const { categoryId, position } of categoriesOrder) {
      await this.categoryRepository.update(categoryId, { position });
    }

    return { message: 'Ordre des catégories mis à jour avec succès' };
  }

  async addNominee(categoryId: number, createNomineeDto: CreateNomineeDto) {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Catégorie avec l'ID ${categoryId} introuvable`,
      );
    }

    const movie = await this.movieRepository.findOne({
      where: { id: createNomineeDto.movie },
    });

    if (!movie) {
      throw new NotFoundException(
        `Film avec l'ID ${createNomineeDto.movie} introuvable`,
      );
    }

    // ✅ Récupérer les MoviePerson correspondant aux ID fournis
    console.log(createNomineeDto.movie);
    const teamIds = Array.isArray(createNomineeDto.team)
      ? createNomineeDto.team
      : [createNomineeDto.team]; // 🔥 Assurer que c'est un tableau
    const team = await this.moviePersonRepository.find({
      where: { id: In(teamIds) }, // ✅ Ici, on est sûr que c'est un tableau
      relations: ['person', 'movie'],
    });

    if (!team.length) {
      throw new NotFoundException(`Aucune personne trouvée pour ce film.`);
    }

    // ✅ Création du nommé avec les entités récupérées
    const nominee = this.nomineeRepository.create({
      category,
      movie,
      team,
      song: createNomineeDto.song || undefined,
    });

    return await this.nomineeRepository.save(nominee);
  }
}
