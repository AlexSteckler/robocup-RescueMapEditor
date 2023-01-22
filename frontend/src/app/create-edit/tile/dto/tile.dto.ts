import {SafeUrl} from "@angular/platform-browser";

export interface Tile {
   readonly id?: string;
   readonly name: string;

   value?: number;
   image?: SafeUrl | undefined;
   paths?: {from: number, to: number, layer: number}[];

   source?: string;
   rotation?: number;
   border?: string[];
   temp?: boolean;

   isBeingDragged?: boolean;
   isPlaceholder?: boolean;
}
