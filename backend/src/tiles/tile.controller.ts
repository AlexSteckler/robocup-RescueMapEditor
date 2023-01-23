/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { Body, Get } from '@nestjs/common/decorators';
import { Post } from '@nestjs/common/decorators/http/request-mapping.decorator';
import { NotFound } from '../util/not-found.decorator';
import { CreateTileDto } from './dto/create-tile.dto';
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
    async create(@Body() createTileDto: CreateTileDto) {
        return this.tileService.create(createTileDto);
    }
}
