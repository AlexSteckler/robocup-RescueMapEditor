import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MapModule } from 'src/maps/map.module';
import { ImageModule } from './image';
import { TilesController } from './tile.controller';
import { Tile, TileSchema } from './tile.schema';
import { TileService } from './tile.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tile.name, schema: TileSchema }]),
    MapModule,
    ImageModule,
  ],
  controllers: [TilesController],
  providers: [TileService],
})
export class TileModule {}
