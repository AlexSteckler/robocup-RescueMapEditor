import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMapDto } from './dto/create-map.dto';
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

  findOne(user: any, id: string) {
    if (user.realm_access.roles.includes('admin')) {
      return this.mapModel.find({ _id: id }).exec();
    } else {
      return this.mapModel.find({ _id: id, createdBy: user.sub }).exec();
    }
  }
}
