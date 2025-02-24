import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { CategoryType } from 'src/categories/entities/category.entity';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(CategoryType)
  type: CategoryType;
}
