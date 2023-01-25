export interface Map {
  id: string;
  name: string;
  description: string;
  createdBy: string;

  tilePosition: {
    tileId: string;
    layer: number;
    row: number;
    column: number;
    rotation: number;
  }[];

  evacuationZonePosition: {
    layer: number;
    row: number;
    column: number;
    entry: { x: number; y: number; rotation: number };
    exit: { x: number; y: number; rotation: number };
    across: boolean;
  };
}
