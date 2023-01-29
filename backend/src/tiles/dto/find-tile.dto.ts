import { IsMongoId } from 'class-validator';

export class FindTileDto {
  @IsMongoId()
  id: string;
}
