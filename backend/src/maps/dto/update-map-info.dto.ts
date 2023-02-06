import { IsArray, IsNumber } from 'class-validator';

export class UpdateMapInfoDto {
  @IsNumber()
  scoreCount: number;

  @IsArray()
  sections: number[];
}
