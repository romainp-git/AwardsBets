/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  Req,
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { AuthGuard } from 'src/auth/Guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() signinUserDto: LoginUserDto) {
    return this.authService.authenticate(signinUserDto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getUserInfo(@Req() request) {
    return request.user;
  }
}
