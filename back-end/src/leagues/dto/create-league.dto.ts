import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { LeagueType } from '../entities/league.entity';

export class CreateLeagueDto {
  @IsNotEmpty()
  @IsNumber()
  competitionId: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(LeagueType)
  status: LeagueType;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  citation?: string;

  @IsOptional()
  @IsArray()
  membersId?: string[];
}
