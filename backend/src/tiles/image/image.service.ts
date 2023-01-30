import { BadRequestException, Injectable } from '@nestjs/common';
import {
  GridFSBucket,
  GridFSBucketReadStream,
  GridFSFile,
  ObjectId,
} from 'mongodb';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

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

    if(doc == null) {
      throw new BadRequestException('Image not found');
    }
    return this.fileModel.openDownloadStream(doc._id);
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
}
