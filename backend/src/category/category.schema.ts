import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Category {
  @Prop()
  name: string;

  @Prop()
  discipline: string[];

  @Prop()
  description: string;

  @Prop()
  location: string;

  @Prop()
  createdBy: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

export type CategoryDocument = Category & Document;
