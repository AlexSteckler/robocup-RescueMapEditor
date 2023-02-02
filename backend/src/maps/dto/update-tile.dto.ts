import { IsNotEmpty } from 'class-validator';

export class UpdateTileDto {
  @IsNotEmpty()
  tilePosition: {
    tileId: string;
    layer: number;
    row: number;
    column: number;
    rotation: number;
  };
}
