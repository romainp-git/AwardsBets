import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  password: string;
}