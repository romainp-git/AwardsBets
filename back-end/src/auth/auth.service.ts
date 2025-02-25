/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { SafeUser } from 'src/users/entities/user.entity';

type AuthResult = { access_token: string; userId: number; username: string };

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(user: SafeUser): Promise<AuthResult> {
    const payload = { sub: user.id, username: user.username };
    const access_token = await this.jwtService.signAsync(payload);
    return { access_token, userId: user.id, username: user.username };
  }

  async authenticate(loginUserDto: LoginUserDto): Promise<AuthResult> {
    const user = await this.validateUser(loginUserDto);
    if (!user) {
      throw new UnauthorizedException('Username ou mot de passe incorrect');
    }
    return this.signIn(user);
  }

  async validateUser(loginUserDto: LoginUserDto): Promise<SafeUser | null> {
    const user = await this.usersService.findByUsername(loginUserDto.username);
    if (user && (await bcrypt.compare(loginUserDto.password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
