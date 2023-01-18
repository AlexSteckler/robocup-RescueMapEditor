export interface Evacuation {
  position: { x: number, y: number };

  exitPlaced: boolean;
  entrancePlaced: boolean;
  alignment: number;

  exitPosition: { x: number, y: number, borderPosition: number };
  entrancePosition: { x: number, y: number, borderPosition: number };
}
