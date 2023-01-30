import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Obstacle {
  @Prop()
  name: string;

  @Prop()
  value: number;

  @Prop()
  imageId: string;

  @Prop()
  location: string;
}

export const ObstacleSchema = SchemaFactory.createForClass(Obstacle);

export type ObstacleDocument = Obstacle & Document;
