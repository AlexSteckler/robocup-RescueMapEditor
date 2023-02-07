import {BadRequestException, Injectable} from '@nestjs/common';
import {GridFSBucket, GridFSBucketReadStream, GridFSFile, ObjectId,} from 'mongodb';
import {InjectConnection} from '@nestjs/mongoose';
import {Connection} from 'mongoose';


@Injectable()
export class ImageService {
    private fileModel: GridFSBucket;

    constructor(@InjectConnection() private connection: Connection) {
        this.fileModel = new GridFSBucket(connection.db);
    }

    async findImages(): Promise<GridFSFile[]> {
        return this.fileModel.find().toArray();
    }

    async findImage(id: string): Promise<GridFSBucketReadStream> {
        const doc = await this.fileModel
            .find({
                _id: new ObjectId(id),
            })
            .tryNext();

        if (doc == null) {
            throw new BadRequestException('Image not found');
        }
        return this.fileModel.openDownloadStream(doc._id);
    }

    async getImageInformation(id: string): Promise<GridFSFile> {
        const doc = await this.fileModel
            .find({
                _id: new ObjectId(id),
            })
            .tryNext();

        if (doc == null) {
            throw new BadRequestException('Image not found');
        }
        return doc;
    }

    async deleteImage(id: string): Promise<GridFSFile> {
        const doc = await this.fileModel
            .find({
                _id: new ObjectId(id),
            })
            .tryNext();
        await this.fileModel.delete(doc._id);
        return doc;
    }

    async updateImage(id: string, imageBuffer: any) {
        await this.connection.db.collection('fs.files').updateOne({
            _id: new ObjectId(id),
        }, {
            $set: {
                length: imageBuffer.length,
                chunkSize: 261120,
                uploadDate: new Date(),
                filename: "map_" + id + ".png",
                contentType: 'image/png',
            }
        }, {
            upsert: true,
        });
        await this.connection.db.collection('fs.chunks').updateOne({
                files_id: new ObjectId(id),
            }, {
                $set: {
                    data: imageBuffer,
                }
            },
            {
                upsert: true,
            });
    }

    async createImage(mapId: string, imageBuffer: any) {
        let file = await this.connection.db
            .collection('fs.files').insertOne({
                _id: new ObjectId(),
                filename: "map_" + mapId + ".png",
                contentType: 'image/png',
                length: imageBuffer.length,
                chunkSize: 261120,
                uploadDate: new Date(),
            });
        await this.connection.db
            .collection('fs.chunks').insertOne({
                _id: new ObjectId(),
                files_id: file.insertedId,
                n: 0,
                data: imageBuffer,
            });
        return file.insertedId;
    }
}
