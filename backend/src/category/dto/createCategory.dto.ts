import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsOptional()
  discipline: string[];

  @IsString()
  @IsOptional()
  description: string;
}
