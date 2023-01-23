export interface Evacuation {
  position: { x: number, y: number };

  exitPosition: { x: number, y: number, borderPosition: number };
  entrancePosition: { x: number, y: number, borderPosition: number };
}
