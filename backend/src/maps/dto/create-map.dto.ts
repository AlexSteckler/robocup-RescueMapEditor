import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMapDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  tilePosition: {
    tileId: string;
    layer: number;
    row: number;
    column: number;
    rotation: number;
  }[];

  @IsOptional()
  @IsArray()
  obstaclePosition: {
    obstacleId: string;
    layer: number;
    x: number;
    y: number;
    rotation: number;
    width: number;
    height: number;
  }[];

  @IsOptional()
  evacuationZonePosition: {
    layer: number;
    row: number;
    column: number;
    entry: { x: number; y: number; rotation: number };
    exit: { x: number; y: number; rotation: number };
    across: boolean;
  };
}
