import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from './entities/vote.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Nominee } from 'src/nominees/entities/nominee.entity';
import { User } from 'src/users/entities/user.entity';
import { VoteDto } from './dto/vote.dto';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private readonly voteRepository: Repository<Vote>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(Nominee)
    private readonly nomineeRepository: Repository<Nominee>,
  ) {}

  async findAll(): Promise<Vote[]> {
    const votes = await this.voteRepository.find({
      relations: ['category', 'nominee', 'user'],
    });
    return votes;
  }

  async voteBatch(user: User, votes: VoteDto[]) {
    const newVotes: Vote[] = [];

    for (const voteDto of votes) {
      const { nomineeId, categoryId, type } = voteDto;

      const category = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });
      if (!category) {
        throw new NotFoundException(
          `Catégorie avec l'ID ${categoryId} introuvable`,
        );
      }

      const nominee = await this.nomineeRepository.findOne({
        where: { id: nomineeId },
      });
      if (!nominee) {
        throw new NotFoundException(
          `Nominé avec l'ID ${nomineeId} introuvable`,
        );
      }

      const existingVote = await this.voteRepository.findOne({
        where: { nominee, user },
      });
      if (existingVote) {
        throw new ConflictException(
          `Vous avez déjà voté pour le nommé ID ${nomineeId}`,
        );
      }
      const newVote = this.voteRepository.create({
        nominee,
        user,
        category,
        type,
      });

      newVotes.push(newVote);
    }

    return this.voteRepository.save(newVotes);
  }

  async findByUser(user: User): Promise<Vote[]> {
    return await this.voteRepository.find({
      where: { user: user },
      relations: ['category', 'nominee', 'user'],
    });
  }

  async deleteVote(voteId: number) {
    const vote = await this.voteRepository.findOne({ where: { id: voteId } });

    if (!vote) {
      throw new NotFoundException(`Catégorie avec l'ID ${voteId} introuvable`);
    }

    await this.voteRepository.delete(voteId);
    return { message: 'Catégorie supprimée avec succès' };
  }
}
