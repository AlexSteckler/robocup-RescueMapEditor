import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateObstacleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  value: number;

  @IsString()
  @IsNotEmpty()
  imageId: string;
}
