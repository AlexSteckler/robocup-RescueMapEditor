import {IsNotEmpty, IsString} from "class-validator";

export class LocationDto {
    @IsString()
    @IsNotEmpty()
    location: string;
}
