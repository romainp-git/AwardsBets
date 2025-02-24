/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  Delete,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { Movie } from './entities/movie.entity';
import { TmdbService } from '../tmdb/tmdb.service'; // ✅ On garde juste le service TMDB
import { CreateMovieDto } from './dto/create-movie.dto';

@Controller('movies')
export class MoviesController {
  constructor(
    private readonly moviesService: MoviesService,
    private readonly tmdbService: TmdbService, // ✅ On appelle TMDB via le service
  ) {}

  // ✅ Liste tous les films en base
  @Get()
  async findAll(): Promise<Movie[]> {
    return this.moviesService.findAll();
  }

  // ✅ Supprimer un film par ID
  @Delete(':id')
  async deleteMovie(@Param('id') id: number) {
    const result = await this.moviesService.deleteMovie(id);
    if (!result)
      throw new NotFoundException(`Le film avec l'ID ${id} n'existe pas.`);
    return { message: 'Film supprimé avec succès' };
  }

  // ✅ Récupère un film depuis la base
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Movie> {
    const movie = await this.moviesService.findOne(id);
    if (!movie) {
      throw new NotFoundException(`Movie with id ${id} not found`);
    }
    return movie;
  }

  // ✅ Recherche un film sur TMDB
  @Get('search/:query')
  async searchMovies(@Param('query') query: string) {
    return this.tmdbService.searchMovies(query);
  }

  // ✅ Récupère les détails d’un film TMDB + ses images
  @Get('tmdb/:tmdbId')
  async getMovieDetails(@Param('tmdbId') tmdbId: number) {
    console.log(`Fetching details for TMDB ID: ${tmdbId}`);
    const movieData = await this.tmdbService.getMovieDetails(tmdbId);
    console.log('Données envoyées', movieData);

    if (!movieData) {
      throw new NotFoundException(`Film TMDB ID ${tmdbId} introuvable`);
    }

    const images = await this.tmdbService.getMovieImages(tmdbId);
    return { ...movieData, images };
  }

  // ✅ Récupère uniquement les images d’un film TMDB
  @Get('tmdb/:tmdbId/images')
  async getMovieImages(@Param('tmdbId') tmdbId: number) {
    return await this.tmdbService.getMovieImages(tmdbId);
  }

  // ✅ Importer un film depuis TMDB dans la base
  @Post('import')
  async importMovie(@Body() movieData: CreateMovieDto) {
    console.log('Data received in backend:', movieData); // ✅ Debug
    return this.moviesService.importFromTmdb(movieData);
  }
}
