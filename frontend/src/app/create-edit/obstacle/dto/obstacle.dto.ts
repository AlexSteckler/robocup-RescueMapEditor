import { SafeUrl } from "@angular/platform-browser";

export interface Obstacle {
  id: string;
  name: string;
  x: number;
  y: number;
  layer: number;

  value?: number;
  rotation?: number;

  imageId?: string;
  image?: SafeUrl | undefined;

  location?: string;

  scale?: { x: number; y: number}
}
