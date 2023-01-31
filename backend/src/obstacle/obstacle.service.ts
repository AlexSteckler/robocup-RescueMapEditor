/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateObstacleDto } from './dto/createObstacle.dto';
import { Obstacle, ObstacleDocument } from './obstacle.schema';

@Injectable()
export class ObstacleService {
    
    
    
    constructor(@InjectModel(Obstacle.name) private obstacleModel: Model<ObstacleDocument>) {}
    
    async findAll(user: any):  Promise<Obstacle[]> {
        if (user.location) {
            return this.obstacleModel.find({$or: [{location: user.location}, {location: null}]}).exec();
          }
          return this.obstacleModel.find().exec();
    }

    async create(user: any, createObstacleDto: CreateObstacleDto): Promise<Obstacle> {
        return this.obstacleModel.create({...createObstacleDto, location: user.location});
    }

    async updateObstacle(id: string, createObstacleDto: CreateObstacleDto): Promise<Obstacle> {
        return this.obstacleModel.findByIdAndUpdate(
            {_id: id}, createObstacleDto, {new: true});
    }

    async deleteObstacle(id: string): Promise<Obstacle> {
        return this.obstacleModel.findByIdAndDelete(id);
    }
}
