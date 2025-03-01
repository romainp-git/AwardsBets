/* eslint-disable @typescript-eslint/no-unsafe-call */

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { LeaguesService } from './leagues.service';
import { CreateLeagueDto } from './dto/create-league.dto';
import { UpdateLeagueDto } from './dto/update-league.dto';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { AuthGuard } from 'src/auth/Guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage, Multer } from 'multer';

@Controller('leagues')
export class LeaguesController {
  constructor(private readonly leaguesService: LeaguesService) {}

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
      limits: { fileSize: 10 * 1024 * 1024 }, // 📌 Limite de 10 Mo
    }),
  )
  @Post()
  create(
    @CurrentUser() user: User,
    @UploadedFile() file: Multer.File,
    @Body() createLeagueDto: CreateLeagueDto,
  ) {
    console.log('📥 Données reçues:', createLeagueDto);
    console.log('📸 Fichier reçu:', file);
    return this.leaguesService.create(createLeagueDto, user, file);
  }

  @Get()
  findAll() {
    return this.leaguesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leaguesService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Get('users/:userId')
  findOneByUser(@Param('userId') userId: string) {
    return this.leaguesService.findAllByUser(userId);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateLeagueDto: UpdateLeagueDto,
  ) {
    return this.leaguesService.update(+id, updateLeagueDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.leaguesService.remove(+id, user);
  }
}
