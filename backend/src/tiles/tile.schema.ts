import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as SchemaMongoose } from 'mongoose';

@Schema({ timestamps: true })
export class Tile {
  @Prop()
  name: string;

  @Prop()
  value: number;

  @Prop()
  paths: { from: number; to: number; layer: number }[];

  @Prop()
  imageId: string;

}

export const TileSchema = SchemaFactory.createForClass(Tile);

export type TileDocument = Tile & Document;
