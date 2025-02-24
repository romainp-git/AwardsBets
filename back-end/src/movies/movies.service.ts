/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { Person } from 'src/persons/entities/person.entity';
import { MoviePerson } from './entities/movieperson.entity';
import { CreateMovieDto } from './dto/create-movie.dto';

const VALID_DEPARTMENTS = {
  Directing: 'Réalisation',
  Writing: 'Scénario',
  Production: 'Production',
  Editing: 'Montage',
  Sound: 'Son',
  'Visual Effects': 'Effets Visuels',
  'Costume & Make-Up': 'Costumes & Maquillage',
  Camera: 'Image',
};

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,

    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,

    @InjectRepository(MoviePerson)
    private readonly moviePersonRepository: Repository<MoviePerson>,
  ) {}

  async importFromTmdb(movieData: CreateMovieDto): Promise<Movie> {
    const movie = this.movieRepository.create({
      title: movieData.title,
      releaseDate: movieData.releaseDate
        ? new Date(movieData.releaseDate)
        : undefined,
      backdrop: movieData.backdrop,
      poster: movieData.poster,
      duration: movieData.duration,
      logo: movieData.logo,
      synopsis: movieData.synopsis,
      genres: movieData.genres,
      rating: movieData.rating,
      tmdbId: movieData.tmdbId,
    });

    // ✅ Sauvegarde du film en base pour récupérer son ID
    const savedMovie = await this.movieRepository.save(movie);
    console.log(`Movie saved with ID: ${savedMovie.id}`);

    const team: MoviePerson[] = [];

    // ✅ 3. Ajouter les 10 premiers acteurs
    for (const personData of movieData.credits.cast.slice(0, 10)) {
      console.log(`Importing Actor:`, personData.name);

      let person = await this.personRepository.findOne({
        where: { name: personData.name },
      });
      const photo = `https://image.tmdb.org/t/p/h632${personData.profile_path}`;

      if (!person) {
        person = this.personRepository.create({
          name: personData.name,
          photo: photo || undefined,
        });
        await this.personRepository.save(person);
      }

      // 🔥 Création de l'association MoviePerson
      const moviePerson = this.moviePersonRepository.create({
        movie: savedMovie,
        person: person,
        roles: ['actor'],
      });

      await this.moviePersonRepository.save(moviePerson);
      team.push(moviePerson);
    }

    // ✅ 4. Ajouter le réalisateur et le scénariste
    for (const personData of movieData.credits.crew) {
      if (Object.keys(VALID_DEPARTMENTS).includes(personData.department)) {
        console.log(`Importing ${personData.job}:`, personData.name);

        const role =
          personData.job.charAt(0).toLowerCase() + personData.job.slice(1); // 🔹 Première lettre en minuscule

        let person = await this.personRepository.findOne({
          where: { name: personData.name },
        });
        const photo = personData.profile_path
          ? `https://image.tmdb.org/t/p/h632${personData.profile_path}`
          : null;

        if (!person) {
          person = this.personRepository.create({
            name: personData.name,
            photo: photo || undefined,
          });
          await this.personRepository.save(person);
        }

        const moviePerson = this.moviePersonRepository.create({
          movie: savedMovie,
          person: person,
          roles: [role], // 🔹 On enregistre le rôle sans le traduire
        });

        await this.moviePersonRepository.save(moviePerson);
        team.push(moviePerson);
      }
    }

    return savedMovie;
  }

  async findAll(): Promise<Movie[]> {
    const movies = await this.movieRepository.find({
      relations: ['team', 'team.person'],
    });

    for (const movie of movies) {
      movie.team = await this.getMovieTeam(movie.id);
    }

    return movies;
  }

  async findOne(id: number): Promise<Movie | null> {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['team', 'team.person'],
    });

    if (!movie) {
      return null;
    }

    movie.team = await this.getMovieTeam(movie.id);

    return movie;
  }

  private async getMovieTeam(movieId: number): Promise<MoviePerson[]> {
    return await this.moviePersonRepository
      .createQueryBuilder('moviePerson')
      .leftJoinAndSelect('moviePerson.person', 'person')
      .where('moviePerson.movieId = :movieId', { movieId })
      .getMany();
  }

  async deleteMovie(id: number): Promise<boolean> {
    const movie = await this.movieRepository.findOne({ where: { id } });
    if (!movie) return false;

    await this.movieRepository.remove(movie);
    return true;
  }
}
