export interface Evacuation {
  layer: number;
    row: number;
    column: number;
    entry: { x: number; y: number; position: number };
    exit: { x: number; y: number; position: number };
    across: boolean;
}
