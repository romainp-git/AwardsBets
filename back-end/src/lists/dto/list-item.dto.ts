import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class ListItemDto {
  @IsNotEmpty()
  @IsNumber()
  movieId: number;

  @IsNotEmpty()
  @IsString()
  type: string;
}
