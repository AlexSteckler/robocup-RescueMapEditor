export interface Map {
  id: string;
  name: string;
  description: string;

  tilePosition: {
    tileId: string;
    layer: number;
    row: number;
    column: number;
    rotation: number;
  }[];

  evacuation: {
    layer: number;
    row: number;
    column: number;
    entry: { x: number; y: number; rotation: number };
    exit: { x: number; y: number; rotation: number };
  };

  createdBy: string;
}
