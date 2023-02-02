import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMapDto } from './dto/create-map.dto';
import { FindObstacleInMapDto } from './dto/find-obstacle-in-map.dto';
import { UpdateEvacuationZoneDto } from './dto/update-evacuationzone.dto';
import { UpdateObstacleDto } from './dto/update-obstacle.dto';
import { UpdateTileDto } from './dto/update-tile.dto';
import { MapDocument } from './map.schema';

@Injectable()
export class MapService {
  constructor(@InjectModel(Map.name) private mapModel: Model<MapDocument>) {}

  findAll(user: any) {
    if (user.realm_access.roles.includes('admin')) {
      return this.mapModel.find().exec();
    } else {
      return this.mapModel.find({ createdBy: user.sub }).exec();
    }
  }

  create(user: any, createMapDto: CreateMapDto) {
    return this.mapModel.create({ createdBy: user.sub, ...createMapDto });
  }

  deleteMap(id: string) {
    return this.mapModel.findByIdAndDelete(id).exec();
  }

  findOne(user: any, id: string) {
    if (user.realm_access.roles.includes('admin')) {
      return this.mapModel.findOne({ _id: id }).exec();
    } else {
      return this.mapModel.findOne({ _id: id, createdBy: user.sub }).exec();
    }
  }

  addTile(updateTileDto: UpdateTileDto, id: string) {
    return this.mapModel
      .findOneAndUpdate(
        { _id: id },
        { $push: { tilePosition: updateTileDto.tilePosition } },
        { new: true },
      )
      .exec();
  }

  deleteTile(id: string, layer: number, row: number, column: number) {
    return this.mapModel
      .findOneAndUpdate(
        {
          _id: id,
          tilePosition: {
            $elemMatch: {
              layer: layer,
              row: row,
              column: column,
            },
          },
        },
        { $pull: { tilePosition: { layer: layer, row: row, column: column } } },
        { new: true },
      )
      .exec();
  }

  addObstacle(id: string, updateObstacleDto: UpdateObstacleDto) {
    return this.mapModel
      .findByIdAndUpdate(
        {
          _id: id,
          obstaclePosition: {
            $elemMatch: {
              obstacleId: updateObstacleDto.obstaclePosition.obstacleId,
            },
          },
        },
        { $push: { obstaclePosition: updateObstacleDto.obstaclePosition } },
        { new: true },
      )
      .exec();
  }

  deleteObstacle(mapId: string, obstacleId: string) {
    return this.mapModel
      .findOneAndUpdate(
        {
          _id: mapId,
          obstaclePosition: {
            $elemMatch: {
              obstacleId: obstacleId,
            },
          },
        },
        { $pull: { obstaclePosition: { obstacleId: obstacleId } } },
        { new: true },
      )
      .exec();
  }

  addEvacuationZone(updateTileDto: UpdateEvacuationZoneDto, id: string) {
    return this.mapModel
      .findOneAndUpdate(
        { _id: id },
        {
          evacuationZonePosition: updateTileDto,
        },
        { new: true },
      )
      .exec();
  }

  deleteEvacuationZone(id: string) {
    return this.mapModel
      .findOneAndUpdate(
        {
          _id: id,
        },
        {
          $unset: { evacuationZonePosition: 1 },
        },
        { new: true },
      )
      .exec();
  }
}
