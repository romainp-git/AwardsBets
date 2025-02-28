import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CategoryOrderDto {
  @IsNumber()
  categoryId: number;

  @IsNumber()
  position: number;
}

export class ReorderCategoriesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryOrderDto)
  categoriesOrder: CategoryOrderDto[];
}
