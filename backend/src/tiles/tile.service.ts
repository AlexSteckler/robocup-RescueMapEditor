import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTileDto } from './dto/create-tile.dto';
import { Tile, TileDocument } from './tile.schema';

@Injectable()
export class TileService {
  constructor(@InjectModel(Tile.name) private tileModel: Model<TileDocument>) {}

  async findAll() {
    return this.tileModel.find().exec();
  }

  async create(createTileDto: CreateTileDto) {
    return this.tileModel.create(createTileDto);
  }
}
