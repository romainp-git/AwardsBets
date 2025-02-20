import { Controller, Post, Delete, Get, Param, Body, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ListsService } from "./lists.service";
import { ListType } from "./entities/list.entity";
import { CurrentUser } from "src/auth/current-user.decorator";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { ListItemDto } from "./dto/list-item.dto";

@Controller("lists")
export class ListsController {
  constructor(private readonly listsService: ListsService) {}
    @UseGuards(JwtAuthGuard)
    @Post()
    async addToList(
        @CurrentUser() user,
        @Body() listItem: ListItemDto
    ) {
        console.log("📌 addToList appelé pour l'utilisateur", user, "avec les données", listItem);
        return this.listsService.addToList(user, listItem);
    }

    @UseGuards(JwtAuthGuard)
    @Delete()
    async removeFromList(
        @CurrentUser() user,
        @Body() listItem: ListItemDto
    ) {
        return this.listsService.removeFromList(user, listItem);
    }

    @UseGuards(JwtAuthGuard)
    @Get(":type")
    async getUserList(
        @CurrentUser() user,
        @Param("type") type: ListType
    ) {
        return this.listsService.getUserList(user, type);
    }
}