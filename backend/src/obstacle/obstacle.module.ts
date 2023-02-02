import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ObstacleController } from './obstacle.controller';
import { Obstacle, ObstacleSchema } from './obstacle.schema';
import { ObstacleService } from './obstacle.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Obstacle.name, schema: ObstacleSchema },
    ]),
  ],
  controllers: [ObstacleController],
  providers: [ObstacleService],
})
export class ObstacleModule {}
