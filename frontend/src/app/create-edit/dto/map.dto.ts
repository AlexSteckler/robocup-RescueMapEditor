export interface Map {
  id: string;
  name: string;
  description: string;
  createdBy: string;

  checkpoints: {
    tileCount: number;
  }[];

  tilePosition: {
    tileId: string;
    layer: number;
    row: number;
    column: number;
    rotation: number;
  }[];

  obstaclePosition: {
    obstacleId: string;
    imageId: string;
    layer: number;
    x: number;
    y: number;
    rotation: number;
    width: number;
    height: number;
    name: string;
  }[];

  evacuationZonePosition: {
    layer: number;
    row: number;
    column: number;
    entry: { x: number; y: number; position: number, layer: number };
    exit: { x: number; y: number; position: number, layer: number };
    across: boolean;
  };
}
