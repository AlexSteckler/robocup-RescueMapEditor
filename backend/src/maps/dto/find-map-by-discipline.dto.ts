import { IsString } from 'class-validator';

export class FindMapByDisciplineDto {
  @IsString()
  discipline: string;
}
