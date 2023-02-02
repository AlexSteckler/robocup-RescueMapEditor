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

  //scale is x=width and y=height of the obstacle
  @IsNotEmpty()
  scale: { x: number; y: number };
}
