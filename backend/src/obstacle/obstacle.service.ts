/* eslint-disable prettier/prettier */
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {CreateObstacleDto} from './dto/createObstacle.dto';
import {Obstacle, ObstacleDocument} from './obstacle.schema';

@Injectable()
export class ObstacleService {


    constructor(@InjectModel(Obstacle.name) private obstacleModel: Model<ObstacleDocument>) {
    }

    async findAll(user: any): Promise<Obstacle[]> {
        let aggregate = [
            {
                $lookup: {
                    from: 'fs.files',
                    localField: 'imageId',
                    foreignField: '_id',
                    as: 'imageInfo'
                }
            },
            {
                // get first element of imageInfo array
                $addFields: {
                    imageInfo: {$arrayElemAt: ['$imageInfo', 0]}
                }

            },
            {
                $addFields: {
                    id: '$_id'
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ];

        if (user.location) {
            return this.obstacleModel.aggregate([
                {
                    $match: {
                        $or: [
                            {location: user.location},
                            {location: null}
                        ]
                    }
                },
                ...aggregate
            ]).exec();
        }
        return this.obstacleModel.aggregate([...aggregate]).exec()
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
