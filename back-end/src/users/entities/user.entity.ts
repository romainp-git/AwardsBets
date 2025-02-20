import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Vote } from 'src/votes/entities/vote.entity';
import { List } from 'src/lists/entities/list.entity';

export enum UserStatus {
    ADMIN = "admin",
    PLAYER = "player",
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

    @Column({ default: 0, type: "float" })
    score: number;

    @Column({
        type: "enum",
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

    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10);
    }
}