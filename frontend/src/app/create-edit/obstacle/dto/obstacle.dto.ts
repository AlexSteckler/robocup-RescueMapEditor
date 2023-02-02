import { SafeUrl } from "@angular/platform-browser";

export interface Obstacle {
  id: string;
  name?: string;
  layer: number;
  x: number;
  y: number;

  value?: number;
  rotation?: number;

  imageId?: string;
  image?: SafeUrl | undefined;

  location?: string;

  width?: number;
  height?: number;
}
