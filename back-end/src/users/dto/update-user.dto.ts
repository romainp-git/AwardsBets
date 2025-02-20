import { IsEmail, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  photo?: string;

  @IsString()
  avatar?: string;

  @IsString()
  color?: string;

  @IsString()
  description?: string;
}