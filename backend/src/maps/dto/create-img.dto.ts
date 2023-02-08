import {IsMongoId, IsNumber} from "class-validator";

export class CreateImgDto {
    @IsMongoId()
    id: string;

}