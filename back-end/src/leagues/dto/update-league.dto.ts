import { PartialType } from '@nestjs/mapped-types';
import { CreateLeagueDto } from './create-league.dto';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateLeagueDto extends PartialType(CreateLeagueDto) {
  @IsNotEmpty()
  @IsNumber()
  id: number;
}
