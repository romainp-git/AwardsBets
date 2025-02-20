import { IsNumber, IsOptional } from 'class-validator';

export class UpdateOddsDto {
  @IsNumber()
  prevWinnerOdds?: number;

  @IsNumber()
  prevLoserOdds?: number;

  @IsNumber()
  currWinnerOdds?: number;

  @IsNumber()
  currLoserOdds?: number;
}