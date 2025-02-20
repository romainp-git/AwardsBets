import { Controller, Param, Delete } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
    constructor(
        private readonly categoriesService: CategoriesService
    ) {}

    // ✅ Supprimer une catégorie d'une compétition
    @Delete(':id')
    async deleteCategory(
        @Param('id') categoryId: number
    ) {
        return this.categoriesService.deleteCategory(categoryId);
    }
}