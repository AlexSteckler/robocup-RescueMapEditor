/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { Get } from '@nestjs/common/decorators';
import { Public } from 'nest-keycloak-connect';
import { TilesService } from './tiles.service';

@Controller({path:'tiles', version: '1'})
export class TilesController {

    constructor(private readonly tileService: TilesService) {}

    @Public()
    @Get()
    async get() {
        return 'test';
    }

}
