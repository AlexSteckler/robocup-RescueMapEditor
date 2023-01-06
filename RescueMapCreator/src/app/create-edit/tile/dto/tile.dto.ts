import {SafeUrl} from "@angular/platform-browser";

export interface Tile {
   readonly id: number;
   source : string;
   image: SafeUrl | undefined;
}
