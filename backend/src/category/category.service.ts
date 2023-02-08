/* eslint-disable prettier/prettier */
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';import { Category } from './category.schema';

@Injectable()
export class CategoryService {


    constructor(@InjectModel(Category.name) private categoryModel: Model<Category>) {
    }

    async findAll(user: any): Promise<Category[]> {

        if ( user !== undefined && user.location) {
            return this.categoryModel.find({
                $or: [
                    {location: user.location},
                    {location: {$exists: false}}
                ]
            }).exec();
        }
        return this.categoryModel.find().exec()
    }

    async create(user: any, createCategoryDto: any): Promise<Category> {
        return this.categoryModel.create({...createCategoryDto, location: user.location});
    }

    async updateCategory(id: string, createCategoryDto: any): Promise<Category> {
        return this.categoryModel.findByIdAndUpdate(
            {_id: id}, createCategoryDto, {new: true});
    }

    async deleteCategory(id: string): Promise<Category> {
        return this.categoryModel.findByIdAndDelete(id);
    }
}
