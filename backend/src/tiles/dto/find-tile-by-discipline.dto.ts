import { IsArray } from 'class-validator';

export class FindTileByDisciplineDto {
  @IsArray()
  disciplines: string[];
}
