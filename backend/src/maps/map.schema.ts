import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

class Evacuation {
  layer: number;
  row: number;
  column: number;
  entry: { x: number; y: number; rotation: number };
  exit: { x: number; y: number; rotation: number };
  across: boolean;
}

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

  @Prop(Evacuation)
  evacuationZonePosition: Evacuation;

  @Prop()
  createdBy: string;
}

export const MapSchema = SchemaFactory.createForClass(Map);

export type MapDocument = Map & Document;
