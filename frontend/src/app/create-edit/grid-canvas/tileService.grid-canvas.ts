import {GridCanvasComponent} from "./grid-canvas.component";
import {ToastrService} from "ngx-toastr";
import {Tile} from "../tile/dto/tile.dto";

export class TileServiceGridCanvas {
  constructor(
    private gridCanvasComponent: GridCanvasComponent,
    private toastr: ToastrService,
  ) {
  }

  loadTile() {
    this.gridCanvasComponent.map!.tilePosition.forEach((tilePosition) => {
      if (tilePosition.layer >= this.gridCanvasComponent.grids.length) {
        for (let i = this.gridCanvasComponent.grids.length; i <= tilePosition.layer; i++) {
          this.gridCanvasComponent.serviceGridCanvas.addLayer();
        }
      }

      let tile = {...this.gridCanvasComponent.tileSelection.find((tile) => tile.id === tilePosition.tileId)} as Tile;
      if (tile != undefined) {
        if (tile.name.includes('start')) {
          this.gridCanvasComponent.startPosition = {layer: tilePosition.layer, x: tilePosition.column, y: tilePosition.row};
        }
        tile.rotation = tilePosition.rotation;
        this.gridCanvasComponent.grids[tilePosition.layer][tilePosition.row][tilePosition.column] = tile;
        this.addPlaceholder(tilePosition.layer, tilePosition.row, tilePosition.column, tile);
      } else {
        this.toastr.error('Tile wurde nicht gefunden');
      }
    });
  }

  addPlaceholder(
    layer: number,
    rowCount: number,
    colCount: number,
    tile: Tile
  ) {
    if (this.gridCanvasComponent.grids[this.gridCanvasComponent.grids.length + layer] == undefined) {
      this.gridCanvasComponent.serviceGridCanvas.addLayer();
    }
    this.gridCanvasComponent.grids[layer + 1][rowCount][colCount] = {
      ...tile,
      isPlaceholder: true,
    };
    if (layer == 1) {
      this.gridCanvasComponent.grids[layer - 1][rowCount][colCount] = {
        ...tile,
        isPlaceholder: true,
      };
    }
  }
}
