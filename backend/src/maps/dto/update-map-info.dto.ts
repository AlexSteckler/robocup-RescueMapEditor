import { IsArray, IsBoolean, IsNumber } from 'class-validator';

export class UpdateMapInfoDto {
  @IsNumber()
  scoreCount: number;

  @IsArray()
  sections: number[];

  @IsBoolean()
  isLeftDirection: boolean;
}
