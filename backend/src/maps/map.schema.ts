import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

class Evacuation {
  layer: number;
  row: number;
  column: number;
  entry: { x: number; y: number; position: number, layer: number };
  exit: { x: number; y: number; position: number, layer: number };
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

  @Prop()
  obstaclePosition: {
    obstacleId: string;
    imageId: string;
    layer: number;
    x: number;
    y: number;
    rotation: number;
    width: number;
    height: number;
  }[];

  @Prop(Evacuation)
  evacuationZonePosition: Evacuation;

  @Prop()
  scoreCount: number;

  @Prop()
  sections: number[];

  @Prop()
  createdBy: string;
}

export const MapSchema = SchemaFactory.createForClass(Map);

export type MapDocument = Map & Document;
