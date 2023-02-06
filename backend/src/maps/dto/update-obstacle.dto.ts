import {IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString} from 'class-validator';

export class UpdateObstacleDto {
    @IsNotEmpty()
    @IsString()
    obstacleId: string;

    @IsNotEmpty()
    @IsString()
    imageId: string;

    @IsNotEmpty()
    @IsNumber()
    layer: number;

    @IsNotEmpty()
    @IsNumber()
    x: number;

    @IsNotEmpty()
    @IsNumber()
    y: number;

    @IsNotEmpty()
    @IsNumber()
    rotation: number;
    @IsNotEmpty()
    @IsNumber()
    width: number;
    @IsNotEmpty()
    @IsNumber()
    height: number;

    @IsOptional()
    @IsNumber()
    value: number;

    @IsOptional()
    @IsString()
    name: string;
}
