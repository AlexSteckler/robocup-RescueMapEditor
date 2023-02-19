import { IsArray, IsBoolean, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateMapInfoDto {
  @IsNumber()
  scoreCount: number;

  @IsArray()
  sections: number[];

  @IsBoolean()
  isLeftDirection: boolean;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsMongoId()
  category: string;
}
