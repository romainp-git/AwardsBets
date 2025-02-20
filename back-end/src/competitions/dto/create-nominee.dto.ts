import { IsArray, IsNumber, IsString } from "class-validator";

export class CreateNomineeDto {
  @IsNumber()
  movie: number; 

  @IsArray()
  team: number[];

  @IsString()
  song?: string;
}