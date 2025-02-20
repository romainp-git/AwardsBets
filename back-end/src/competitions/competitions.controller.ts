import { Controller, Post, Get, Body, Param, Delete } from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateNomineeDto } from './dto/create-nominee.dto';

@Controller('competitions')
export class CompetitionsController {
    constructor(private readonly competitionsService: CompetitionsService) {}

    // ✅ Créer une compétition
    @Post()
    create(@Body() createCompetitionDto: CreateCompetitionDto) {
        return this.competitionsService.create(createCompetitionDto);
    }

    // ✅ Récupérer toutes les compétitions
    @Get()
    findAll() {
        return this.competitionsService.findAll();
    }

    // ✅ Récupérer une compétition spécifique avec ses catégories
    @Get(':id')
    async getCompetition(@Param('id') id: number) {
        return this.competitionsService.findOne(id);
    }

    // ✅ Supprimer une compétition
    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.competitionsService.remove(id);
    }

    // ✅ Ajouter une catégorie à une compétition
    @Post(':id/categories')
    async addCategory(
        @Param('id') competitionId: number,
        @Body() createCategoryDto: CreateCategoryDto,
    ) {
        return this.competitionsService.addCategory(competitionId, createCategoryDto);
    }

    @Post(':id/categories/:categoryId/nominees')
    async addNominee(
        @Param('categoryId') categoryId: number,
        @Body() createNomineeDto: CreateNomineeDto
        ) {
        return this.competitionsService.addNominee(categoryId, createNomineeDto);
    }
}