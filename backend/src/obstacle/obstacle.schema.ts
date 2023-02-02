import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { number } from 'joi';
import { Schema as SchemaMongoose } from 'mongoose';

@Schema({ timestamps: true })
export class Obstacle {
  @Prop()
  name: string;

  @Prop()
  value: number;

  @Prop({ type: SchemaMongoose.Types.ObjectId })
  imageId: { type: SchemaMongoose.Types.ObjectId; Ref: 'fs.file' };

  @Prop()
  location: string;

  @Prop()
  width: number;

  @Prop()
  height: number;
}

export const ObstacleSchema = SchemaFactory.createForClass(Obstacle);

export type ObstacleDocument = Obstacle & Document;
