import {GridCanvasComponent} from "./grid-canvas.component";
import {ToastrService} from "ngx-toastr";
import {Tile} from "../tile/dto/tile.dto";
import {ImageService} from "src/app/shared/image.service";
import {Obstacle} from "../obstacle/dto/obstacle.dto";
import {DomSanitizer} from "@angular/platform-browser";

export class TileObstacleServiceGridCanvas {
  constructor(
    private gridCanvasComponent: GridCanvasComponent,
    private imageService: ImageService,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer
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
          this.gridCanvasComponent.startPosition = {
            layer: tilePosition.layer,
            x: tilePosition.column,
            y: tilePosition.row
          };
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

  loadObstacle(obstacleSelection: Obstacle[]) {
    this.gridCanvasComponent.map!.obstaclePosition.forEach((obstaclePosition) => {
        let image = obstacleSelection.find((obstacle: Obstacle) => obstacle.imageId === obstaclePosition.imageId)?.image;
        let obstacle = {...obstaclePosition, id: obstaclePosition.obstacleId, image, name: obstaclePosition.name} as Obstacle;
        this.gridCanvasComponent.obstacles.push(obstacle);
      }
    );
  }
}
