import { IsNotEmpty } from 'class-validator';

export class UpdateObstacleDto {
  @IsNotEmpty()
  obstaclePosition: { 
    obstacleId: string;
    imageId: string;
    layer: number;
    x: number;
    y: number;
    rotation: number;
    width: number;
    height: number;
  };
}
