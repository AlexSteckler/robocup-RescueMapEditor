import {SafeUrl} from "@angular/platform-browser";

export interface Tile {
   readonly id?: string;
   readonly name: string;
   image?: SafeUrl | undefined;
   paths?: Array<Array<number>> | undefined;

   source?: string;
   rotation?: number;
   border?: string[];
   temp?: boolean
}
