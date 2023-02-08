import { IsMongoId } from 'class-validator';

export class FindCategoryDto {
  @IsMongoId()
  id: string;
}
