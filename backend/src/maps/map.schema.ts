import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Map {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  tilePosition: {
    tileId: string;
    layer: number;
    row: number;
    column: number;
    rotation: number;
  }[];

  @Prop()
  evacuation: {
    layer: number;
    row: number;
    column: number;
    entry: { x: number; y: number; rotation: number };
    exit: { x: number; y: number; rotation: number };
  };

  @Prop()
  createdBy: string;
}

export const MapSchema = SchemaFactory.createForClass(Map);

export type MapDocument = Map & Document;
