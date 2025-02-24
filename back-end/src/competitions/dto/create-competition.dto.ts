import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateCompetitionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  edition: string; // "97e cérémonie"

  @IsDateString()
  date: string; // "2025-03-03"

  @IsString()
  startTime: string; // "01:00"

  @IsString()
  endTime: string; // "04:00"

  @IsString()
  venue: string; // "Dolby Theatre"

  @IsString()
  city: string; // "Hollywood"

  @IsString()
  country: string; // "États-Unis"
}
