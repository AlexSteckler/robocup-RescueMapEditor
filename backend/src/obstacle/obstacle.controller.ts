/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import {AuthenticatedUser, Public} from 'nest-keycloak-connect';
import { CreateObstacleDto } from './dto/createObstacle.dto';
import { FindObstacleDto } from './dto/findObstacle.dto';
import { Obstacle } from './obstacle.schema';
import { ObstacleService } from './obstacle.service';

@Controller({path:'obstacle', version: '1'})
export class ObstacleController {
    
    constructor(private readonly obstacleService: ObstacleService) {}

    @Get()
    @Public()
    async getAll(
        @AuthenticatedUser() user: any): Promise<Obstacle[]> {
        return this.obstacleService.findAll(user);
    }

    @Post()
    async createObstacle(
        @AuthenticatedUser() user: any,
        @Body() createObstacleDto: CreateObstacleDto): Promise<Obstacle> {
        return this.obstacleService.create(user, createObstacleDto);
    }

    @Patch(':id')
    async updateObstacle(
        @Body() createObstacleDto: CreateObstacleDto,
        @Param() findObstacleDto: FindObstacleDto
    ): Promise<Obstacle> {
        return this.obstacleService.updateObstacle(findObstacleDto.id, createObstacleDto);
    }

    @Delete(':id')
    async deleteObstacle(
        @Param() findObstacleDto: FindObstacleDto): Promise<Obstacle> {
        return this.obstacleService.deleteObstacle(findObstacleDto.id);
    }

}
