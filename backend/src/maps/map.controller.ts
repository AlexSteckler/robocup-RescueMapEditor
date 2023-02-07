/* eslint-disable prettier/prettier */
import {Body, Controller, Delete, Get, Param, Patch, Post, Req, Res,} from '@nestjs/common';
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
import {Request, Response} from "express";
import puppeteer from "puppeteer";
import {CreateImgDto} from "./dto/create-img.dto";

@Controller({path: 'map', version: '1'})
export class MapsController {
    constructor(private readonly mapService: MapService) {
    }


    @Patch('pdf')
    async getPdfTest(@Body() createImgDto: CreateImgDto, @Res() res: Response, @AuthenticatedUser() user: any, @Req() req: Request): Promise<any> {
        // Create a browser instance
        let size = await this.getMapSize(user, createImgDto.id);
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

        await page.goto(`http://localhost:4401/show/${createImgDto.id}`, {waitUntil: 'networkidle2'});

        await page.emulateMediaType('screen');

        const content = await page.$("body");
        const imageBuffer = await content.screenshot({omitBackground: true});

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', 'attachment; filename=result.png');
        res.send(imageBuffer);


        await browser.close();
    }

    @Get(':id/size')
    @Public()
    async getSize(@Param() findMapDto: FindMapDto, @AuthenticatedUser() user: any) {
        return this.getMapSize(user, findMapDto.id);
    }

    async getMapSize(user, id) {
        let map = await this.mapService.findOne(user, id);

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
    @Public()
    async getOne(
        @Param() findMapDto: FindMapDto,
        @AuthenticatedUser() user: any,
    ) {
        return this.mapService.findOne(user, findMapDto.id);
    }

    @Get()
    @NotFound()
    async getAll(@AuthenticatedUser() user: any) {
        return this.mapService.findAll(user);
    }

    @Post()
    async create(
        @Body() createMapDto: CreateMapDto,
        @AuthenticatedUser() user: any,
    ) {
        return this.mapService.create(user, createMapDto);
    }

    @Delete(':id')
    async deleteMap(@Param() findMapDto: FindMapDto) {
        return this.mapService.deleteMap(findMapDto.id);
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
        @Body() deleteTileDto: DeleteTileDto,
        @Param() findMapDto: FindMapDto,
    ) {
        return this.mapService.deleteTile(
            findMapDto.id,
            deleteTileDto.layer,
            deleteTileDto.row,
            deleteTileDto.column,
        );
    }

    @Patch(':id/obstacle')
    async updateObstacle(
        @Body() updateObstacleDto: UpdateObstacleDto,
        @Param() findMapDto: FindMapDto,
    ) {
        await this.mapService.deleteObstacle(findMapDto.id, updateObstacleDto.obstacleId);
        return this.mapService.addObstacle(findMapDto.id, updateObstacleDto);
    }

    @Delete(':mapId/obstacle/:obstacleId')
    async deleteObstacle(@Param() findMapDto: FindObstacleInMapDto) {
        return this.mapService.deleteObstacle(findMapDto.mapId, findMapDto.obstacleId);
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
