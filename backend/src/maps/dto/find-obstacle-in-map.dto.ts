import { IsMongoId, IsString } from 'class-validator';

export class FindObstacleInMapDto {
  @IsMongoId()
  mapId: string;

  @IsString()
  obstacleId: string;
}
