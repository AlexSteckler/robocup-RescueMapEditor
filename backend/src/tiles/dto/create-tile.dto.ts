import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTileDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  value: number;

  @IsArray()
  @IsNotEmpty()
  paths: { from: number; to: number; layer: number }[];

  @IsString()
  @IsNotEmpty()
  imageId: string;
}
