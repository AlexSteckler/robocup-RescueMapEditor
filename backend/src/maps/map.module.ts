import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MapsController } from './map.controller';
import { MapSchema } from './map.schema';
import { MapService } from './map.service';
import { ImageService } from '../tiles/image/image.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Map.name, schema: MapSchema }])],
  controllers: [MapsController],
  providers: [MapService, ImageService],
  exports: [MapService],
})
export class MapModule {}
