import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MapsController } from './map.controller';
import { MapSchema } from './map.schema';
import { MapService } from './map.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Map.name, schema: MapSchema }]),
    MapModule,
  ],
  controllers: [MapsController],
  providers: [MapService],
})
export class MapModule {}
