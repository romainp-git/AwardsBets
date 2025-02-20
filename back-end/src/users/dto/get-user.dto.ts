import { IsEmail, IsInt, IsNumber, IsString } from 'class-validator';

export class GetUserDto {
    @IsInt()
    id: number;

    @IsString()
    username: string;

    @IsString()
    photo: string;

    @IsString()
    avatar: string;

    @IsString()
    color: string;

    @IsNumber()
    score: number;

    @IsEmail()
    email: string;

    @IsString()
    description: string;
}