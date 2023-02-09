/* eslint-disable prettier/prettier */
import {Body, Controller, Delete, Get, Param, Patch, Post,} from '@nestjs/common';
import {AuthenticatedUser, Public} from 'nest-keycloak-connect';
import {NotFound} from '../util/not-found.decorator';
import {CreateMapDto} from './dto/create-map.dto';
import {DeleteTileDto} from './dto/delete-tile.dto';
import {FindMapDto} from './dto/find-map.dto';
import {FindObstacleInMapDto} from './dto/find-obstacle-in-map.dto';
import {UpdateEvacuationZoneDto} from './dto/update-evacuationzone.dto';
import {UpdateMapInfoDto} from './dto/update-map-info.dto';
import {UpdateObstacleDto} from './dto/update-obstacle.dto';
import {UpdateTileDto} from './dto/update-tile.dto';
import {MapService} from './map.service';
import puppeteer from "puppeteer";
import {CreateImgDto} from "./dto/create-img.dto";
import {ImageService} from "../tiles/image/image.service";
import { FindMapByDisciplineDto } from './dto/find-map-by-discipline.dto';

@Controller({path: 'map', version: '1'})
export class MapsController {
    constructor(private readonly mapService: MapService, private readonly imageService: ImageService) {
    }


    @Patch('pdf')
    async generatePreviewImage(@Body() createImgDto: CreateImgDto, @AuthenticatedUser() user: any): Promise<any> {
        console.log("Generating preview image for map " + createImgDto.id)
        // Create a browser instance
        let size = await this.getMapSize(user, createImgDto.id);
        let map = await this.mapService.findOnePublic(createImgDto.id);
        console.log(size, map);
        let browser;
        if (!process.env.LOCAL) {
            browser = await puppeteer.launch({
                args: ['--no-sandbox'],
                executablePath: '/usr/bin/google-chrome'
            });
        } else {
            browser = await puppeteer.launch({
                args: ['--no-sandbox'],
            });
        }

        // Create a new page
        const page = await browser.newPage();

        await page.setViewport({width: (size.width * 100) + 10, height: (size.height * 100) + 10})

        await page.goto(`${process.env.URI}/show/${createImgDto.id}`, {waitUntil: 'networkidle2'});

        await page.emulateMediaType('screen');

        const content = await page.$("body");
        const imageBuffer = await content.screenshot({omitBackground: true});

        if(imageBuffer) {
            if (map.imageId !== undefined) {
                await this.imageService.updateImage(map.imageId, imageBuffer);
            } else {
                let imageId = await this.imageService.createImage(map.id, imageBuffer);
                await this.mapService.updateImageId(createImgDto.id, imageId);
            }
        }


        await browser.close();
    }

    @Get(':id/size')
    @Public()
    async getSize(@Param() findMapDto: FindMapDto, @AuthenticatedUser() user: any) {
        return this.getMapSize(user, findMapDto.id);
    }

    async getMapSize(user, id) {
        let map = await this.mapService.findOnePublic(id);

        let leftUpperCorner = {x: 30, y: 30};
        let rightLowerCorner = {x: 0, y: 0};
        map?.tilePosition.forEach((tilePosition) => {
            if (tilePosition.column < leftUpperCorner.x) {
                leftUpperCorner.x = tilePosition.column;
            }
            if (tilePosition.row < leftUpperCorner.y) {
                leftUpperCorner.y = tilePosition.row;
            }
            if (tilePosition.column > rightLowerCorner.x) {
                rightLowerCorner.x = tilePosition.column;
            }
            if (tilePosition.row > rightLowerCorner.y) {
                rightLowerCorner.y = tilePosition.row;
            }
        });
        if (map?.evacuationZonePosition) {
            if (map?.evacuationZonePosition.column < leftUpperCorner.x) leftUpperCorner.x = map?.evacuationZonePosition.column;
            if (map?.evacuationZonePosition.row < leftUpperCorner.y) leftUpperCorner.y = map?.evacuationZonePosition.row;
            if ((map?.evacuationZonePosition.column + (map.evacuationZonePosition.across ? 4 : 3)) > rightLowerCorner.x) rightLowerCorner.x
                = map?.evacuationZonePosition.column + (map.evacuationZonePosition.across ? 3 : 2);
            if (map?.evacuationZonePosition.row + (map.evacuationZonePosition.across ? 3 : 4) > rightLowerCorner.y) rightLowerCorner.y
                = map?.evacuationZonePosition.row + (map.evacuationZonePosition.across ? 2 : 3);
        }
        return {
            width: rightLowerCorner.x - leftUpperCorner.x + 1,
            height: rightLowerCorner.y - leftUpperCorner.y + 1,
            leftUpperCorner: leftUpperCorner,
            rightLowerCorner: rightLowerCorner
        }
    }

    @Get(':id')
    @NotFound()
    async getOne(
        @Param() findMapDto: FindMapDto,
        @AuthenticatedUser() user: any,
    ) {
        return this.mapService.findOne(user, findMapDto.id);
    }

    @Get(':id/public')
    @NotFound()
    @Public()
    async getOnePublic(
        @Param() findMapDto: FindMapDto
    ) {
        return this.mapService.findOnePublic(findMapDto.id);
    }

    @Get()
    @NotFound()
    async getAll(@AuthenticatedUser() user: any) {
        return this.mapService.findAll(user);
    }

    @Get(':discipline')
    @NotFound()
    async getMapByDiscipline(
        @Body() findMapByDisciplineDto: FindMapByDisciplineDto,
        @AuthenticatedUser() user: any,
        ) {
        return this.mapService.findMapsInDiscipline(user, findMapByDisciplineDto);
    }

    @Post()
    async create(
        @Body() createMapDto: CreateMapDto,
        @AuthenticatedUser() user: any
    ) {
        return  this.mapService.create(user, createMapDto);
    }

    @Delete(':id')
    async deleteMap(@Param() findMapDto: FindMapDto) {
        console.log("Delete map");
        let newVar = await this.mapService.deleteMap(findMapDto.id);
        if (newVar.imageId !== undefined) {
            await this.imageService.deleteImage(newVar.imageId);
        }
        return newVar;
    }

    @Patch(':id')
    async updateMap(
        @Body() updateMapInfoDto: UpdateMapInfoDto,
        @Param() findMapDto: FindMapDto,
    ) {
        return this.mapService.updateMap(findMapDto.id, updateMapInfoDto);
    }

    @Patch(':id/tile')
    async updateTile(
        @Body() updateTileDto: UpdateTileDto,
        @Param() findMapDto: FindMapDto,
        @AuthenticatedUser() user: any
    ) {
        console.log("Update tile");
        await this.mapService.deleteTile(
            findMapDto.id,
            updateTileDto.tilePosition.layer,
            updateTileDto.tilePosition.row,
            updateTileDto.tilePosition.column,
        );
        let newVar = await this.mapService.addTile(updateTileDto, findMapDto.id);
        this.generatePreviewImage({id: findMapDto.id}, user);
        return newVar;
    }

    @Patch('tile/:id/delete')
    async deleteTile(
        @Body() deleteTileDto: DeleteTileDto,
        @Param() findMapDto: FindMapDto,
        @AuthenticatedUser() user: any
    ) {
        console.log("Delete tile");
        let newVar = await this.mapService.deleteTile(
            findMapDto.id,
            deleteTileDto.layer,
            deleteTileDto.row,
            deleteTileDto.column,
        );
        this.generatePreviewImage({id: findMapDto.id}, user);
        return newVar;
    }

    @Patch(':id/obstacle')
    async updateObstacle(
        @Body() updateObstacleDto: UpdateObstacleDto,
        @Param() findMapDto: FindMapDto,
        @AuthenticatedUser() user: any
    ) {
        console.log("Update obstacle");
        await this.mapService.deleteObstacle(findMapDto.id, updateObstacleDto.obstacleId);
        let newVar = await this.mapService.addObstacle(findMapDto.id, updateObstacleDto);
        this.generatePreviewImage({id: findMapDto.id}, user);
        return newVar;
    }

    @Delete(':mapId/obstacle/:obstacleId')
    async deleteObstacle(@Param() findMapDto: FindObstacleInMapDto, @AuthenticatedUser() user: any) {
        console.log("Delete obstacle");
        let newVar = await this.mapService.deleteObstacle(findMapDto.mapId, findMapDto.obstacleId);
        this.generatePreviewImage({id: findMapDto.mapId}, user);
        return newVar;
    }

    @Patch('evacuation/:id')
    async updateEvacuation(
        @Body() updateEvacuationZoneDto: UpdateEvacuationZoneDto,
        @Param() findMapDto: FindMapDto,
        @AuthenticatedUser() user: any
    ) {
        console.log("Update evacuation");
        let newVar = await this.mapService.addEvacuationZone(
            updateEvacuationZoneDto,
            findMapDto.id,
        );
        this.generatePreviewImage({id: findMapDto.id}, user);
        return newVar;
    }

    @Delete('evacuation/:id')
    async deleteEvacuation(@Param() findMapDto: FindMapDto, @AuthenticatedUser() user: any) {
        console.log("Delete evacuation");
        let newVar = await this.mapService.deleteEvacuationZone(findMapDto.id);
        this.generatePreviewImage({id: findMapDto.id}, user);
        return newVar;
    }


}
