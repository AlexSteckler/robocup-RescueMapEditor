import { IsMongoId, IsNotEmpty, IsNumber, isNumber } from 'class-validator';

export class DeleteTileDto {
  @IsNotEmpty()
  @IsNumber()
  layer: number;

  @IsNotEmpty()
  @IsNumber()
  row: number;

  @IsNotEmpty()
  @IsNumber()
  column: number;
}
