import {IsMongoId, IsNotEmpty, IsString} from "class-validator";

export class FindImageParamsDto {
    @IsMongoId()
    id: string;
}