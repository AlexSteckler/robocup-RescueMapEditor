import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {CreateMapDto} from './dto/create-map.dto';
import {UpdateEvacuationZoneDto} from './dto/update-evacuationzone.dto';
import {UpdateMapInfoDto} from './dto/update-map-info.dto';
import {UpdateObstacleDto} from './dto/update-obstacle.dto';
import {UpdateTileDto} from './dto/update-tile.dto';
import {Map, MapDocument} from './map.schema';
import {ObjectId} from 'mongodb';
import {FindMapByDisciplineDto} from './dto/find-map-by-discipline.dto';

@Injectable()
export class MapService {

    constructor(@InjectModel(Map.name) private mapModel: Model<MapDocument>) {
    }

    findAll(user: any): Promise<Map[]> {
        if (user.realm_access.roles.includes('admin')) {
            return this.mapModel.find().exec();
        } else {
            return this.mapModel.find({location: user.location}).exec();
        }
    }

    findMapsInDiscipline(user: any, findMapByDisciplineDto: FindMapByDisciplineDto) {
        if (user.realm_access.roles.includes('admin')) {
            return this.mapModel
                .find({discipline: findMapByDisciplineDto.discipline})
                .exec();
        } else {
            return this.mapModel
                .find({
                    discipline: findMapByDisciplineDto.discipline,
                    createdBy: user.sub,
                })
                .exec();
        }
    }

    create(user: any, createMapDto: CreateMapDto) {
        return this.mapModel.create({createdBy: user.sub, ...createMapDto, location: user.location});
    }

    deleteMap(id: string) {
        return this.mapModel.findByIdAndDelete(id).exec();
    }

    findOne(user: any, id: string) {
        if (!user.realm_access.roles.includes('admin')) {
            return this.mapModel.findOne({_id: id, createdBy: user.sub}).exec();
        }
        return this.mapModel.findOne({_id: id}).exec();
    }

    findOnePublic(id: string) {
        return this.mapModel.findOne({_id: id}).exec();
    }

    updateMap(id: string, updateMapInfoDto: UpdateMapInfoDto) {
        return this.mapModel
            .findByIdAndUpdate(id, updateMapInfoDto, {new: true})
            .exec();
    }

    addTile(updateTileDto: UpdateTileDto, id: string) {
        return this.mapModel
            .findOneAndUpdate(
                {_id: id},
                {$push: {tilePosition: updateTileDto.tilePosition}},
                {new: true},
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
                {$pull: {tilePosition: {layer: layer, row: row, column: column}}},
                {new: true},
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
                            obstacleId: updateObstacleDto.obstacleId,
                        },
                    },
                },
                {$push: {obstaclePosition: updateObstacleDto}},
                {new: true},
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
                {$pull: {obstaclePosition: {obstacleId: obstacleId}}},
                {new: true},
            )
            .exec();
    }

    addEvacuationZone(updateTileDto: UpdateEvacuationZoneDto, id: string) {
        return this.mapModel
            .findOneAndUpdate(
                {_id: id},
                {
                    evacuationZonePosition: updateTileDto,
                },
                {new: true},
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
                    $unset: {evacuationZonePosition: 1},
                },
                {new: true},
            )
            .exec();
    }

    async updateImageId(id: string, imageId: ObjectId) {
        return this.mapModel
            .findOneAndUpdate({_id: id}, {imageId: imageId}, {new: true})
            .exec();
    }
}
