/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import {AuthenticatedUser, Public, Roles} from 'nest-keycloak-connect';
import { Body, Get, Param } from '@nestjs/common/decorators';
import { Delete, Patch, Post } from '@nestjs/common/decorators/http/request-mapping.decorator';
import { NotFound } from '../util/not-found.decorator';
import { CreateTileDto } from './dto/create-tile.dto';
import { Tile } from './tile.schema';
import { FindTileDto } from './dto/find-tile.dto';
import { TileService } from './tile.service';
import { MapService } from 'src/maps/map.service';

@Controller({path:'tile', version: '1'})
export class TilesController {

    constructor(private readonly tileService: TileService, private readonly mapService: MapService) {}
    
    @Get()
    @NotFound()
    @Public()
    async getAll(
        @AuthenticatedUser() user: any) : Promise<Tile[]>  {
        return this.tileService.findAll(user);
    }

    @Post()
    @Roles({roles: ['realm:admin','realm:quali']})
    async create(
        @AuthenticatedUser() user: any, 
        @Body() createTileDto: CreateTileDto) : Promise<Tile> {
        return this.tileService.create(user, createTileDto);
    }

    @Patch(':id')
    @Roles({roles: ['realm:admin','realm:quali']})
    async updateTile(
        @Body() createTileDto: CreateTileDto, 
        @Param() findTileDto: FindTileDto) : Promise<Tile> {
            return this.tileService.updateTile(findTileDto.id, createTileDto);
    }

    @Delete(':id')
    @Roles({roles: ['realm:admin','realm:quali']})
    async deleteTile(@Param() findTileDto: FindTileDto) : Promise<Tile> {
        return this.tileService.deleteTile(findTileDto.id);
    }

    @Get('/map/:id')
    @NotFound()
    @Roles({roles: ['realm:admin','realm:quali']})
    async getTilesByMapId(@AuthenticatedUser() user: any, @Param() findTileByMapId: FindTileDto) : Promise<Tile[]> {
        let map = await this.mapService.findOne(user, findTileByMapId.id);

        if (!map || map.discipline === undefined || map.discipline === null || map.discipline === '') {
            return [];
        } 
        return this.tileService.findTilesByDiscipline(user, map.discipline);
    }

}
