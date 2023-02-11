import {Pipe, PipeTransform} from "@angular/core";
import {Map} from "../../create-edit/dto/map.dto";

@Pipe({name: 'GetMapsForCategory'})
export class GetMapsForCategoryPipe implements PipeTransform {
  transform(categoryId: string, maps: Map[]): Map[] {
    return maps.filter((map: Map) => map.category === categoryId);
  }
}
