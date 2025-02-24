import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
  Column,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Nominee } from 'src/nominees/entities/nominee.entity';
import { Category } from 'src/categories/entities/category.entity';

export enum VoteType {
  WINNER = 'winner',
  LOSER = 'loser',
}

@Entity()
@Unique(['user', 'nominee']) // ✅ Unicité du vote par user et nominee
export class Vote {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.votes, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Nominee, (nominee) => nominee.votes, { onDelete: 'CASCADE' })
  nominee: Nominee;

  @ManyToOne(() => Category, (category) => category.votes, {
    onDelete: 'CASCADE',
  })
  category: Category;

  @Column({
    type: 'enum',
    enum: VoteType,
  })
  type: VoteType;
}
