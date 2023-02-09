import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

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

  @Prop()
  disciplines: string[];

  @Prop()
  location: string;
}

export const TileSchema = SchemaFactory.createForClass(Tile);

export type TileDocument = Tile & Document;
