import {SafeUrl} from "@angular/platform-browser";

export interface Tile {
   readonly id: string;
   readonly name: string;
   source : string;
   image: SafeUrl | undefined;
   paths: Array<Array<number>> | undefined;
   rotation: number;
}
