import { IsString, IsOptional, IsArray, ValidateNested, IsDate, IsNumber, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class ListItemDto {
    @IsNotEmpty()
    @IsNumber()
    movieId: number;

    @IsNotEmpty()
    @IsString()
    type: string;
}