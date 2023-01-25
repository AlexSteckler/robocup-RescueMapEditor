import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
} from '@nestjs/common';
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { map } from 'rxjs';
import { NotFound } from '../util/not-found.decorator';
import { CreateMapDto } from './dto/create-map.dto';
import { FindMapDto } from './dto/find-map.dto';
import { UpdateEvacuationZoneDto } from './dto/update-evacuationzone.dto';
import { UpdateTileDto } from './dto/update-tile.dto';
import { MapService } from './map.service';

@Controller({ path: 'map', version: '1' })
export class MapsController {
  constructor(private readonly mapService: MapService) {}

  @Get()
  @NotFound()
  async getAll(@AuthenticatedUser() user: any) {
    return this.mapService.findAll(user);
  }

  @Get(':id')
  @NotFound()
  async getOne(
    @Param() findMapDto: FindMapDto,
    @AuthenticatedUser() user: any,
  ) {
    return this.mapService.findOne(user, findMapDto.id);
  }

  @Post()
  async create(
    @Body() createMapDto: CreateMapDto,
    @AuthenticatedUser() user: any,
  ) {
    return this.mapService.create(user, createMapDto);
  }

  @Patch('tile/:id')
  async updateTile(
    @Body() updateTileDto: UpdateTileDto,
    @Param() findMapDto: FindMapDto,
  ) {
    await this.mapService.deleteTile(
      findMapDto.id,
      updateTileDto.tilePosition.layer,
      updateTileDto.tilePosition.row,
      updateTileDto.tilePosition.column,
    );
    return this.mapService.addTile(updateTileDto, findMapDto.id);
  }

  @Patch('tile/:id/delete')
  async deleteTile(
    @Body() updateTileDto: UpdateTileDto,
    @Param() findMapDto: FindMapDto,
  ) {
    return this.mapService.deleteTile(
      findMapDto.id,
      updateTileDto.tilePosition.layer,
      updateTileDto.tilePosition.row,
      updateTileDto.tilePosition.column,
    );
  }

  @Patch('evacuation/:id')
  async updateEvacuation(
    @Body() updateEvacuationZoneDto: UpdateEvacuationZoneDto,
    @Param() findMapDto: FindMapDto,
  ) {
    return this.mapService.addEvacuationZone(
      updateEvacuationZoneDto,
      findMapDto.id,
    );
  }

  @Delete('evacuation/:id')
  async deleteEvacuation(@Param() findMapDto: FindMapDto) {
    return this.mapService.deleteEvacuationZone(findMapDto.id);
  }
}
