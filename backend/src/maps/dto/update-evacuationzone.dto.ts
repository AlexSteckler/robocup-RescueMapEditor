import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  isNumber,
  IsOptional,
} from 'class-validator';

export class UpdateEvacuationZoneDto {
  @IsNotEmpty()
  @IsNumber()
  layer: number;

  @IsNotEmpty()
  @IsNumber()
  row: number;

  @IsNotEmpty()
  @IsNumber()
  column: number;

  @IsNotEmpty()
  @IsBoolean()
  across: boolean;

  @IsOptional()
  entry: { x: number; y: number; position: number, layer: number };

  @IsOptional()
  exit: { x: number; y: number; position: number, layer: number };
}
