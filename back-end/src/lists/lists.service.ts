import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { List, ListType } from './entities/list.entity';
import { User } from 'src/users/entities/user.entity';
import { Movie } from 'src/movies/entities/movie.entity';
import { ListItemDto } from './dto/list-item.dto';

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}
  async addToList(user: User, listItem: ListItemDto): Promise<List> {
    const newListItem = this.listRepository.create({
      user: user,
      movie: { id: listItem.movieId },
      type: listItem.type as ListType,
    });
    return this.listRepository.save(newListItem);
  }

  async removeFromList(user: User, listItem: ListItemDto): Promise<void> {
    await this.listRepository.delete({
      user,
      movie: { id: listItem.movieId },
      type: listItem.type as ListType,
    });
  }

  async getUserList(user: User, type: ListType): Promise<List[]> {
    return this.listRepository.find({
      where: { user, type },
      relations: ['movie'],
    });
  }
}
