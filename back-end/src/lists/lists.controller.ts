import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ListsService } from './lists.service';
import { ListType } from './entities/list.entity';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { ListItemDto } from './dto/list-item.dto';
import { User } from 'src/users/entities/user.entity';
import { AuthGuard } from 'src/auth/Guards/auth.guard';

@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}
  @UseGuards(AuthGuard)
  @Post()
  async addToList(@CurrentUser() user, @Body() listItem: ListItemDto) {
    console.log(
      "📌 addToList appelé pour l'utilisateur",
      user,
      'avec les données',
      listItem,
    );
    return this.listsService.addToList(user as User, listItem);
  }

  @UseGuards(AuthGuard)
  @Delete()
  async removeFromList(@CurrentUser() user, @Body() listItem: ListItemDto) {
    return this.listsService.removeFromList(user as User, listItem);
  }

  @UseGuards(AuthGuard)
  @Get(':type')
  async getUserList(@CurrentUser() user, @Param('type') type: ListType) {
    return this.listsService.getUserList(user as User, type);
  }
}
