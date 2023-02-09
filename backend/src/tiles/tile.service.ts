/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTileDto } from './dto/create-tile.dto';
import { Tile, TileDocument } from './tile.schema';

@Injectable()
export class TileService {
  
  constructor(@InjectModel(Tile.name) private tileModel: Model<TileDocument>) {}

  async findAll(user: any) : Promise<Tile[]>  {
    if (user !== undefined && user.location) {
      return this.tileModel.find({$or: [{location: user.location}, {location: null}]}).exec();
    }
    return this.tileModel.find().exec();
  }

  async create(user: any, createTileDto: CreateTileDto) : Promise<Tile> {

    return this.tileModel.create({...createTileDto, location: user.location});
  }

  async updateTile(id: string, tileDto: any) : Promise<Tile> {
    return this.tileModel.findByIdAndUpdate(
      {_id: id}, tileDto, {new: true});
  }

  async deleteTile(id: string): Promise<Tile> {
    return this.tileModel.findByIdAndDelete(id);
  }

  async findTilesByDiscipline(user: any, discipline: string): Promise<Tile[]> {
    if (user !== undefined && user.location) {
      return this.tileModel.find({$or: [{location: user.location}, {location: null}], disciplines: { $in: discipline.toLowerCase() }}).exec();
    }
    return this.tileModel.find(
      { 
        disciplines: { $in: discipline.toLowerCase() }
      }).exec();
  }

}