import {GridCanvasComponent} from "./grid-canvas.component";
import {ToastrService} from "ngx-toastr";
import {Tile} from "../tile/dto/tile.dto";
import {ImageService} from "src/app/shared/image.service";
import {Obstacle} from "../obstacle/dto/obstacle.dto";
import {DomSanitizer} from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ElementRef, ViewChild } from "@angular/core";
import { GridCanvasService } from "./grid-canvas.service";

export class TileObstacleServiceGridCanvas {
  constructor(
    private gridCanvasComponent: GridCanvasComponent,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private  gridCanvasService: GridCanvasService,
  ) {
  }

  loadTile() {
    let failedTile: boolean = false;

    this.gridCanvasComponent.map!.tilePosition.forEach((tilePosition) => {
      if (tilePosition.layer >= this.gridCanvasComponent.grids.length) {
        for (let i = this.gridCanvasComponent.grids.length; i <= tilePosition.layer; i++) {
          this.gridCanvasComponent.serviceGridCanvas.addLayer();
        }
      }

      let tile = {...this.gridCanvasComponent.tileSelection.find((tile) => tile.id === tilePosition.tileId)} as Tile;
      if (tile != undefined && tile.name != undefined) {
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
        failedTile = true;

        this.gridCanvasService.deleteTile(this.gridCanvasComponent.map!.id, tilePosition.layer, tilePosition.row, tilePosition.column).subscribe(() => {});
      }
    });

    if (failedTile) {
      this.modalService.open(this.gridCanvasComponent.basicModal, {centered: true}).result
      .then((result) => {
        this.toastr.info('Alle fehlerhaften Kacheln wurden entfernt.')
      } , (reason) => {
        this.toastr.info('Alle fehlerhaften Kacheln wurden entfernt.')
      });
    }
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
      isPlaceholder: true
     };
    if (layer == 1) {
      this.gridCanvasComponent.grids[layer - 1][rowCount][colCount] = {
        ...tile,
        isPlaceholder: true
      };
    }
  }

  loadObstacle(obstacleSelection: Obstacle[]) {
    this.gridCanvasComponent.map!.obstaclePosition.forEach((obstaclePosition) => {
        let foundObstacle = obstacleSelection.find((obstacle: Obstacle) => obstacle.imageId === obstaclePosition.imageId);
        let obstacle = {...obstaclePosition, id: obstaclePosition.obstacleId, image : foundObstacle?.image, name: obstaclePosition.name, value: foundObstacle?.value} as Obstacle;
        this.gridCanvasComponent.obstacles.push(obstacle);
      }
    );
  }
}
