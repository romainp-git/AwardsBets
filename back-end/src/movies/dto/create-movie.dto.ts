import { IsString, IsOptional, IsArray, ValidateNested, IsDate, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMovieDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  releaseDate?: Date;

  @IsOptional()
  @IsNumber()
  rating: number;

  @IsOptional()
  @IsString()
  backdrop?: string;

  @IsOptional()
  @IsString()
  poster?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  synopsis?: string;

  @IsOptional()
  @IsString()
  genres?: string;

  @IsOptional()
  @IsString()
  tmdbId?: string;

  @IsOptional()
  @IsNumber()
  duration?: number;
  
  credits: any;
}