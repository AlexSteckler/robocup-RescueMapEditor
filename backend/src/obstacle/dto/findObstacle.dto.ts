import { IsMongoId } from 'class-validator';

export class FindObstacleDto {
  @IsMongoId()
  id: string;
}
