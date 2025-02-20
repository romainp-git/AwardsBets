import { IsNotEmpty, IsNumber, IsEnum } from 'class-validator';

export enum VoteType {
    WINNER = "winner",
    LOSER = "loser"
}

export class VoteDto {
    @IsNotEmpty()
    @IsNumber()
    nomineeId: number;

    @IsNotEmpty()
    @IsNumber()
    categoryId: number;

    @IsNotEmpty()
    @IsEnum(VoteType, { message: "Le type de vote doit être 'Winner' ou 'Loser'" })
    type: VoteType;
}