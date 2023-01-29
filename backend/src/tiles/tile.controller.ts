/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { Body, Get, Param } from '@nestjs/common/decorators';
import { Delete, Patch, Post } from '@nestjs/common/decorators/http/request-mapping.decorator';
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { NotFound } from '../util/not-found.decorator';
import { CreateTileDto } from './dto/create-tile.dto';
import { FindTileDto } from './dto/find-tile.dto';
import { Tile } from './tile.schema';
import { TileService } from './tile.service';

@Controller({path:'tile', version: '1'})
export class TilesController {

    constructor(private readonly tileService: TileService) {}
    
    @Get()
    @NotFound()
    async getAll(
        @AuthenticatedUser() user: any) : Promise<Tile[]>  {
        return this.tileService.findAll(user);
    }

    @Post()
    async create(
        @AuthenticatedUser() user: any, 
        @Body() createTileDto: CreateTileDto) : Promise<Tile> {
        return this.tileService.create(user, createTileDto);
    }

    @Patch(':id')
    async updateTile(
        @Body() createTileDto: CreateTileDto, 
        @Param() findTileDto: FindTileDto) : Promise<Tile> {
            return this.tileService.updateTile(findTileDto.id, createTileDto);
    }

    @Delete(':id')
    async deleteTile(@Param() findTileDto: FindTileDto) : Promise<Tile> {
        return this.tileService.deleteTile(findTileDto.id);
    }
}
