/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { AuthenticatedUser, Public } from 'nest-keycloak-connect';
import { Category } from './category.schema';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { FindCategoryDto } from './dto/findCategory.dto';

@Controller({path:'category', version: '1'})
export class CategoryController {
    
    constructor(private readonly categoryService: CategoryService) {}

    @Get()
    @Public()
    async getAll(
        @AuthenticatedUser() user: any): Promise<Category[]> {
        return this.categoryService.findAll(user);
    }

    @Post()
    async createCategory(
        @AuthenticatedUser() user: any,
        @Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
        return this.categoryService.create(user, createCategoryDto);
    }

    @Patch(':id')
    async updateCategory(
        @Body() createCategoryDto: CreateCategoryDto,
        @Param() findCategoryDto: FindCategoryDto
    ): Promise<Category> {
        return this.categoryService.updateCategory(findCategoryDto.id, createCategoryDto);
    }

    @Delete(':id')
    async deleteCategory(
        @Param() findCategoryDto: FindCategoryDto): Promise<Category> {
        return this.categoryService.deleteCategory(findCategoryDto.id);
    }

}