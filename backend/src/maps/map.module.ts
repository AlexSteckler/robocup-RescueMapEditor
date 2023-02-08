import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {MapsController} from './map.controller';
import {MapSchema} from './map.schema';
import {MapService} from './map.service';
import {ImageService} from "../tiles/image/image.service";
import {ImageModule} from "../tiles/image";
import {ImageControllerV1} from "../tiles/image/image.controller.v1";

@Module({
    imports: [
        MongooseModule.forFeature([{name: Map.name, schema: MapSchema}]),
        MapModule,
    ],
    controllers: [MapsController],
    providers: [MapService, ImageService],
})
export class MapModule {
}
