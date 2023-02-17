import {IsNotEmpty, IsString} from "class-validator";

export class UpdateQualiLocation {
    @IsString()
    @IsNotEmpty()
    location: string;
}