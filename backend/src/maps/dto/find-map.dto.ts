import { IsMongoId } from 'class-validator';

export class FindMapDto {
  @IsMongoId()
  id: string;
}
