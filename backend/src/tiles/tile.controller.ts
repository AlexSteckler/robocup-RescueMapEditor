/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { Body, Get, Param } from '@nestjs/common/decorators';
import { Patch, Post } from '@nestjs/common/decorators/http/request-mapping.decorator';
import { Public } from 'nest-keycloak-connect';
import { UpdateTileDto } from 'src/maps/dto/update-tile.dto';
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
    async getAll() {
        return this.tileService.findAll();
    }

    @Post()
    async create(@Body() createTileDto: CreateTileDto) : Promise<Tile> {
        return this.tileService.create(createTileDto);
    }

    @Patch(':id')
    async updateTile(
        @Body() createTileDto: CreateTileDto, 
        @Param() findTileDto: FindTileDto) {
            return this.tileService.updateTile(findTileDto.id, createTileDto);
    }
}
