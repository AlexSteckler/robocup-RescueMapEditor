/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { CreateObstacleDto } from './dto/createObstacle.dto';
import { FindObstacleDto } from './dto/findObstacle.dto';
import { Obstacle } from './obstacle.schema';
import { ObstacleService } from './obstacle.service';

@Controller('obstacle')
export class ObstacleController {
    
    constructor(private readonly obstacleService: ObstacleService) {}

    @Get()
    async getAll(
        @AuthenticatedUser() user: any): Promise<Obstacle[]> {
        return this.obstacleService.findAll(user);
    }

    @Post()
    async create(
        @AuthenticatedUser() user: any,
        @Body() createObstacleDto: CreateObstacleDto): Promise<Obstacle> {
        return this.obstacleService.create(user, createObstacleDto);
    }

    @Delete(':id')
    async deleteObstacle(
        @Param() findObstacleDto: FindObstacleDto): Promise<Obstacle> {
        return this.obstacleService.deleteObstacle(findObstacleDto.id);
    }

}
