import {IsNotEmpty, IsString} from "class-validator";

export class UpdateUserCredentials {
    @IsString()
    @IsNotEmpty()
    id: string;
}