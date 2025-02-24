import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Nominee } from './entities/nominee.entity';
import { Vote } from 'src/votes/entities/vote.entity';
import { VoteDto } from './dto/vote.dto';
import { User } from 'src/users/entities/user.entity';
import { Category } from 'src/categories/entities/category.entity';
import { UpdateOddsDto } from './dto/update-odds.dto';
import axios from 'axios';

@Injectable()
export class NomineesService {
  constructor(
    @InjectRepository(Nominee)
    private readonly nomineeRepository: Repository<Nominee>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(Vote)
    private readonly voteRepository: Repository<Vote>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOne(id: number): Promise<Nominee> {
    const nominee = await this.nomineeRepository.findOne({
      where: { id },
      relations: ['votes'],
    });
    if (!nominee) {
      throw new NotFoundException(`Nommé avec l'ID ${id} introuvable`);
    }
    return nominee;
  }

  async findAll(): Promise<Nominee[]> {
    return await this.nomineeRepository.find({
      relations: [
        'votes',
        'movie',
        'category',
        'team',
        'team.person',
        'competition',
        'category',
      ],
    });
  }

  async voteForNominee(user: User, voteDto: VoteDto) {
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
      throw new NotFoundException(`Nominé avec l'ID ${nomineeId} introuvable`);
    }

    const existingVote = await this.voteRepository.findOne({
      where: { nominee, user },
    });
    if (existingVote) {
      throw new ConflictException('Vous avez déjà voté pour ce nominé');
    }

    const newVote = this.voteRepository.create({
      nominee,
      user,
      category,
      type,
    });

    return this.voteRepository.save(newVote);
  }

  async updateOdds(
    nomineeId: number,
    updateOddsDto: UpdateOddsDto,
  ): Promise<Nominee> {
    const nominee = await this.nomineeRepository.findOne({
      where: { id: nomineeId },
    });

    if (!nominee) {
      throw new NotFoundException(`Nommé avec l'ID ${nomineeId} introuvable`);
    }

    Object.assign(nominee, updateOddsDto); // 🔥 Mise à jour partielle des champs odds
    return this.nomineeRepository.save(nominee);
  }

  async deleteNominee(nomineeId: number) {
    const nominee = await this.nomineeRepository.findOne({
      where: { id: nomineeId },
    });
    if (!nominee) {
      throw new NotFoundException(`Nommé avec l'ID ${nomineeId} introuvable`);
    }
    await this.nomineeRepository.delete(nomineeId);
    return { message: 'Nommé supprimé avec succès' };
  }

  async setWinner(nomineeId: number) {
    const nominee = await this.nomineeRepository.findOne({
      where: { id: nomineeId },
      relations: ['category', 'movie'],
    });
    if (!nominee) throw new NotFoundException('Nommé introuvable');

    const category = nominee.category;
    const previousWinner = await this.nomineeRepository.findOne({
      where: { category: { id: category.id }, winner: true },
    });

    console.log(
      '⚠️ Ancien gagnant détecté :',
      previousWinner ? previousWinner.id : 'Aucun',
    );

    await this.nomineeRepository.update({ category }, { winner: false });
    nominee.winner = true;
    await this.nomineeRepository.save(nominee);

    await this.updateUsersScores();

    // 📢 Envoyer une notification aux utilisateurs
    await this.notifyUsers(nominee.category.name, nominee.movie.title);

    return { message: `Le nommé ${nomineeId} est maintenant gagnant.` };
  }

  async resetAllWinners(): Promise<{ message: string }> {
    await this.nomineeRepository.update({}, { winner: false });
    return { message: 'Tous les nommés ont été réinitialisés à false.' };
  }

  async updateUsersScores() {
    // 1️⃣ Récupération des users et mise à zéro des scores
    const users = await this.userRepository.find();
    users.forEach((user) => (user.score = 0));
    await this.userRepository.save(users);
    console.log('🔄 Scores des utilisateurs réinitialisés à zéro.');

    // 2️⃣ Récupération des catégories et votes
    const categories = await this.categoryRepository.find({
      relations: ['nominees'],
    });
    const votes = await this.voteRepository.find({
      relations: ['user', 'nominee', 'category'],
    });

    // 3️⃣ Parcours des catégories pour recalculer les scores
    for (const category of categories) {
      const winner = category.nominees.find((nominee) => nominee.winner);
      if (!winner) {
        console.log(
          `⚠️ Pas de gagnant défini pour la catégorie ${category.name}, on passe.`,
        );
        continue;
      }

      // Liste des nominés qui sont des losers
      const losers = category.nominees.filter(
        (nominee) => nominee.id !== winner.id,
      );

      console.log(`🏆 Catégorie ${category.name}: Winner = ${winner.id}`);

      // 4️⃣ Attribution des points aux utilisateurs
      for (const user of users) {
        const userVotes = votes.filter(
          (vote) =>
            vote.user.id === user.id && vote.category.id === category.id,
        );

        let pointsGagnes = 0;

        // Vérifier s'il a trouvé le winner
        const hasWinner = userVotes.some(
          (vote) => vote.nominee.id === winner.id && vote.type === 'winner',
        );

        // Vérifier s'il a trouvé un loser
        const foundLoser = userVotes.some((vote) =>
          losers.some(
            (loser) => loser.id === vote.nominee.id && vote.type === 'loser',
          ),
        );

        let userLoserOdds = 1;
        const userLoserVote = userVotes.find((vote) => vote.type === 'loser');
        if (userLoserVote) {
          const loserNominee = losers.find(
            (nominee) => nominee.id === userLoserVote.nominee.id,
          );
          if (loserNominee) {
            userLoserOdds = loserNominee.currLoserOdds;
          }
        }

        if (hasWinner) {
          pointsGagnes = 10 * winner.currWinnerOdds + 10 * userLoserOdds;
        } else if (foundLoser) {
          pointsGagnes = 10 * userLoserOdds;
        }

        console.log(`👤 ${user.username}: +${pointsGagnes.toFixed(1)} pts`);

        // Mettre à jour le score du user
        user.score += pointsGagnes;
      }
    }

    // 5️⃣ Mise à jour des scores des utilisateurs en base
    await this.userRepository.save(users);
    console.log('✅ Scores des utilisateurs recalculés et mis à jour !');
  }

  async notifyUsers(categoryName: string, nomineeName: string) {
    const users = await this.userRepository.find({
      where: { pushToken: Not(IsNull()) },
    });

    const messages = users.map((user) => ({
      to: user.pushToken,
      sound: 'default',
      title: '🏆 Nouveau gagnant désigné !',
      body: `${nomineeName} a remporté la catégorie ${categoryName} !`,
      data: { category: categoryName, winner: nomineeName },
    }));

    await axios.post('https://exp.host/--/api/v2/push/send', messages, {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
