import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { NotFound } from 'src/util/not-found.decorator';
import { CreateMapDto } from './dto/create-map.dto';
import { FindMapDto } from './dto/find-map.dto';
import { MapService } from './map.service';

@Controller({ path: 'maps', version: '1' })
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
}
