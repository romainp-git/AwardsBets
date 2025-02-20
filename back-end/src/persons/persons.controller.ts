import { Controller, Get, Post, Body } from '@nestjs/common';
import { PersonsService } from './persons.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { Person } from './entities/person.entity';

@Controller('persons') // 👈 Définit la route /persons
export class PersonsController {
  constructor(private readonly personsService: PersonsService) {}

  @Post()
  async create(@Body() createPersonDto: CreatePersonDto): Promise<Person> {
    return this.personsService.create(createPersonDto);
  }

  @Get()
  async findAll(): Promise<Person[]> {
    return this.personsService.findAll();
  }
}