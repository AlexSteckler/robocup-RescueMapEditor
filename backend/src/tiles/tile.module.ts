import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImageModule } from './image';
import { TilesController } from './tile.controller';
import { Tile, TileSchema } from './tile.schema';
import { TileService } from './tile.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tile.name, schema: TileSchema }]),
    ImageModule,
  ],
  controllers: [TilesController],
  providers: [TileService],
})
export class TileModule {}
