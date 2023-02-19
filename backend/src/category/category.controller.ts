/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { AuthenticatedUser, Roles } from 'nest-keycloak-connect';
import { Category } from './category.schema';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { FindCategoryDto } from './dto/findCategory.dto';

@Controller({path:'category', version: '1'})
export class CategoryController {
    
    constructor(private readonly categoryService: CategoryService) {}

    @Get()
    async getAll(
        @AuthenticatedUser() user: any): Promise<Category[]> {
        let categories = await this.categoryService.findAll(user);
        return categories.sort((a: any, b: any) => {
            if (a.name == 'Standart') return 1;
            if (b.name == 'Standart') return -1;
            return ((new Date(a.createdAt).getTime()) < (new Date(b.createdAt).getTime())) ? 1 : -1}
        );
        
    }

    @Post()
    @Roles({roles: ['realm:admin','realm:quali','realm:mapper']})
    async createCategory(
        @AuthenticatedUser() user: any,
        @Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
        return this.categoryService.create(user, createCategoryDto);
    }

    @Patch(':id')
    @Roles({roles: ['realm:admin','realm:quali','realm:mapper']})
    async updateCategory(
        @Body() createCategoryDto: CreateCategoryDto,
        @Param() findCategoryDto: FindCategoryDto
    ): Promise<Category> {
        return this.categoryService.updateCategory(findCategoryDto.id, createCategoryDto);
    }

    @Delete(':id')
    @Roles({roles: ['realm:admin','realm:quali','realm:mapper']})
    async deleteCategory(
        @AuthenticatedUser() user: any,
        @Param() findCategoryDto: FindCategoryDto): Promise<Category> {
        return this.categoryService.deleteCategory(user, findCategoryDto.id);
    }
}
