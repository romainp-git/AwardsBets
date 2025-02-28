/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Vote } from 'src/votes/entities/vote.entity';
import { List } from 'src/lists/entities/list.entity';

export enum UserStatus {
  ADMIN = 'admin',
  PLAYER = 'player',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  photo?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  color?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: 0, type: 'float' })
  score: number;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PLAYER,
  })
  status: UserStatus;

  @OneToMany(() => Vote, (vote) => vote.user, { cascade: true })
  votes: Vote[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  pushToken?: string;

  @OneToMany(() => List, (list) => list.user)
  lists: List[];

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      const salt: number = 10;
      this.password = await bcrypt.hash(this.password, salt);
    }
  }
}

export type SafeUser = Omit<User, 'password' | 'hashPassword'>;
