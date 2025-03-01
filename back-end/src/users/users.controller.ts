/* eslint-disable @typescript-eslint/no-unsafe-call */

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Patch,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from 'src/auth/current-user.decorator';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, Multer } from 'multer';
import { extname } from 'path';

import { AuthGuard } from 'src/auth/Guards/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('register-push-token')
  @UseGuards(AuthGuard)
  async registerPushToken(
    @CurrentUser() user,
    @Body() { expoPushToken }: { expoPushToken: string },
  ) {
    if (!expoPushToken) {
      throw new BadRequestException('Token de notification requis');
    }

    await this.usersService.savePushToken(user.id, expoPushToken);
    return { message: 'Push token enregistré avec succès' };
  }

  @Get()
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Patch('/reset-scores')
  async resetAllScores() {
    return this.usersService.resetAllScore();
  }

  @UseGuards(AuthGuard)
  @Get('infos')
  async getUserInfos(@CurrentUser() user) {
    return this.usersService.findOne(user.id);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const fileExt = extname(file.originalname);
          const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
          cb(null, fileName);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  @Patch('update-profile')
  async updateUserProfile(
    @CurrentUser() user,
    @UploadedFile() file: Multer.File,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    console.log('📥 Données reçues:', updateUserDto);
    console.log('📸 Fichier reçu:', file);

    const fileUrl = file
      ? `https://awards-bets.fr/uploads/${file.filename}`
      : user.photo;

    return this.usersService.updateUser(user.id, {
      ...updateUserDto,
      photo: fileUrl,
    });
  }

  @UseGuards(AuthGuard)
  @Delete('delete-photo')
  async deletePhoto(@CurrentUser() user) {
    console.log('📥 User reçu pour supp photo:', user);
    await this.usersService.deleteUserPhoto(user.id);
    return { message: 'Photo supprimée avec succès' };
  }
}
