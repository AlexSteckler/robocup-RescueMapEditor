import {Component, OnInit} from '@angular/core';
import {GridCanvasService} from "../create-edit/grid-canvas/grid-canvas.service";
import {ActivatedRoute} from "@angular/router";
import {Map} from "../create-edit/dto/map.dto";
import {TilesService} from "../create-edit/tile/tiles.service";
import {ImageService} from "../shared/image.service";
import {ObstacleService} from "../create-edit/obstacle/obstacle.service";
import {firstValueFrom} from "rxjs";
import {Tile} from "../create-edit/tile/dto/tile.dto";
import {DomSanitizer} from "@angular/platform-browser";
import {Evacuation} from "../create-edit/dto/evacuation.dto";
import {Obstacle} from "../create-edit/obstacle/dto/obstacle.dto";

export const EXITCOLOR: string = 'green';
export const ENTRANCECOLOR: string = '#f0f0f0';

@Component({
  selector: 'app-show',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class ShowComponent implements OnInit {
  map: Map | undefined;
  grid: Array<Array<Tile>> = [];
  obstacles: Obstacle[] = [];

  overflowTiles: { tile: Tile, x: number, y: number }[] = [];

  constructor(
    private mapService: GridCanvasService,
    private activatedRoute: ActivatedRoute,
    private imageService: ImageService,
    private tilesService: TilesService,
    private obstacleService: ObstacleService,
    private sanitizer: DomSanitizer
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.mapService.getMap(params['id']).subscribe((map: Map) => {
        this.drawMap(map);
      });
    })
  }

  private async drawMap(map: Map) {
    this.map = map;
    let tiles = await firstValueFrom(this.tilesService.getTiles());
    let obstacles = await firstValueFrom(this.obstacleService.getObstacles());
    let size = await firstValueFrom(this.mapService.getSize(map.id));
    let leftUpperCorner: { x: number, y: number } = size.leftUpperCorner;
    let rightLowerCorner: { x: number, y: number } = size.rightLowerCorner;
    for (const tilePosition of map.tilePosition) {
      await this.loadTile(tilePosition.tileId, tiles);
    }
    await this.loadObstacle(map.obstaclePosition, obstacles);
    this.drawTiles(rightLowerCorner, leftUpperCorner, map, tiles);

    this.drawEvacuationZone(map.evacuationZonePosition, leftUpperCorner, rightLowerCorner);

    this.drawObstacles(map.obstaclePosition, obstacles, leftUpperCorner, rightLowerCorner);
  }

  private drawTiles(rightLowerCorner: { x: number; y: number }, leftUpperCorner: { x: number; y: number }, map: Map, tiles: Tile[]) {
    for (let row = 0; row <= rightLowerCorner.y - leftUpperCorner.y; row++) {
      let rowArray = [];
      for (let col = 0; col <= rightLowerCorner.x - leftUpperCorner.x; col++) {
        let tile = map.tilePosition.find((tilePosition) =>
          tilePosition.row === row + leftUpperCorner.y && tilePosition.column === col + leftUpperCorner.x && tilePosition.layer <= 1);
        try {
          let completeTile = tiles.find((searchedTile) => searchedTile.id === tile!.tileId);
          rowArray.push({...completeTile!, rotation: tile!.rotation});
        } catch (e) {
          rowArray.push({name: '', id: '0', border: ['', '', '', '']});
        }
      }
      this.grid.push(rowArray);
    }

    map.tilePosition.filter((tilePosition) => tilePosition.layer > 1).forEach((tilePosition) => {
      let completeTile = tiles.find((searchedTile) => searchedTile.id === tilePosition!.tileId);
      let tile = this.grid[tilePosition.row - leftUpperCorner.y][tilePosition.column - leftUpperCorner.x];
      if (tile === undefined || !tile.name) {
        this.grid[tilePosition.row - leftUpperCorner.y][tilePosition.column - leftUpperCorner.x] = {
          ...completeTile!,
          rotation: tilePosition!.rotation
        }
      } else {
        this.overflowTiles.push({
          tile: {
            ...completeTile!, rotation: tilePosition!.rotation, isPlaceholder: false
          },
          x: tilePosition.column - leftUpperCorner.x,
          y: tilePosition.row - leftUpperCorner.y
        });
      }
    });
  }

  private drawEvacuationZone(evacuationZonePosition: Evacuation, leftUpperCorner: { x: number; y: number }, rightLowerCorner: { x: number; y: number }) {
    if (evacuationZonePosition === undefined) {
      return;
    }
    let y = evacuationZonePosition.row - leftUpperCorner.y;
    let x = evacuationZonePosition.column - leftUpperCorner.x;
    if (evacuationZonePosition.across) {
      this.grid[y][x] = {name: 'evacuationZoneAcross_00', border: ['black', '', '', 'black']};
      this.grid[y][x + 1] = {name: 'evacuationZoneAcross_01', border: ['black', '', '', '']};
      this.grid[y][x + 2] = {name: 'evacuationZoneAcross_02', border: ['black', '', '', '']};
      this.grid[y][x + 3] = {name: 'evacuationZoneAcross_03', border: ['black', 'black', '', '']};
      this.grid[y + 1][x + 3] = {name: 'evacuationZoneAcross_13', border: ['', 'black', '', '']};
      this.grid[y + 2][x + 3] = {name: 'evacuationZoneAcross_23', border: ['', 'black', 'black', '']};
      this.grid[y + 2][x + 2] = {name: 'evacuationZoneAcross_22', border: ['', '', 'black', '']};
      this.grid[y + 2][x + 1] = {name: 'evacuationZoneAcross_21', border: ['', '', 'black', '']};
      this.grid[y + 2][x] = {name: 'evacuationZoneAcross_20', border: ['', '', 'black', 'black']};
      this.grid[y + 1][x] = {name: 'evacuationZoneAcross_10', border: ['', '', '', 'black']};
      this.grid[y + 1][x + 1] = {name: 'evacuationZoneAcross_11', border: ['', '', '', '']};
      this.grid[y + 1][x + 2] = {name: 'evacuationZoneAcross_12', border: ['', '', '', '']};
    } else {
      this.grid[y][x] = {name: 'evacuationZoneUpright_00', border: ['black', '', '', 'black']};
      this.grid[y][x + 1] = {name: 'evacuationZoneUpright_01', border: ['black', '', '', '']};
      this.grid[y][x + 2] = {name: 'evacuationZoneUpright_02', border: ['black', 'black', '', '']};
      this.grid[y + 1][x + 2] = {name: 'evacuationZoneUpright_12', border: ['', 'black', '', '']};
      this.grid[y + 2][x + 2] = {name: 'evacuationZoneUpright_22', border: ['', 'black', '', '']};
      this.grid[y + 3][x + 2] = {name: 'evacuationZoneUpright_32', border: ['', 'black', 'black', '']};
      this.grid[y + 3][x + 1] = {name: 'evacuationZoneUpright_31', border: ['', '', 'black', '']};
      this.grid[y + 3][x] = {name: 'evacuationZoneUpright_30', border: ['', '', 'black', 'black']};
      this.grid[y + 2][x] = {name: 'evacuationZoneUpright_20', border: ['', '', '', 'black']};
      this.grid[y + 1][x] = {name: 'evacuationZoneUpright_10', border: ['', '', '', 'black']};
      this.grid[y + 1][x + 1] = {name: 'evacuationZoneUpright_11', border: ['', '', '', '']};
      this.grid[y + 2][x + 1] = {name: 'evacuationZoneUpright_21', border: ['', '', '', '']};
    }
    if (evacuationZonePosition.entry) {
      this.grid[evacuationZonePosition.entry.y - leftUpperCorner.y][evacuationZonePosition.entry.x - leftUpperCorner.x]
        .border![evacuationZonePosition.entry.position] = ENTRANCECOLOR;
    }
    if (evacuationZonePosition.exit) {
      this.grid[evacuationZonePosition.exit.y - leftUpperCorner.y][evacuationZonePosition.exit.x - leftUpperCorner.x]
        .border![evacuationZonePosition.exit.position] = EXITCOLOR;
    }

  }

  private async loadTile(tileId: string, tiles: Tile[]) {
    let tile = tiles.find((tile) => tile.id === tileId);
    if (tile !== undefined) {
      let image = await firstValueFrom(this.imageService.getImg(tile.imageId!));
      let objectURL = URL.createObjectURL(image);
      let img = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      tile!.image = img;
    }
  }

  private drawObstacles(obstacles: any[], obstaclesOriginal: Obstacle[], leftUpperCorner: { x: number; y: number }, rightLowerCorner: { x: number; y: number }) {
    obstacles.forEach((obstacle) => {
      let obstacleOriginal = obstaclesOriginal.find((obstacleOriginal) => obstacleOriginal.imageId === obstacle.imageId);
      if (
        obstacleOriginal !== undefined
        && (obstacle.x - (leftUpperCorner.x * 100) + obstacle.width) > 0
        && (obstacle.y - (leftUpperCorner.y * 100) + obstacle.height) > 0
        && (obstacle.x) < (rightLowerCorner.x + 1) * 100
        && (obstacle.y) < (rightLowerCorner.y + 1) * 100
      ) {
        this.obstacles.push({
          id: obstacle.obstacleId,
          imageId: obstacleOriginal.imageId,
          layer: obstacle.layer,
          x: obstacle.x - (leftUpperCorner.x * 100) + 5,
          y: obstacle.y - (leftUpperCorner.y * 100) + 5,
          rotation: obstacle.rotation,
          width: obstacle.width,
          height: obstacle.height,
          image: obstacleOriginal.image,
        });
      }
    })
  }

  private async loadObstacle(obstaclePosition: { obstacleId: string; imageId: string; layer: number; x: number; y: number; rotation: number; width: number; height: number; name: string }[], obstacles: Obstacle[]) {
    for (let obstacle of obstaclePosition) {
      let obstacleData = obstacles.find((obstacleData) => obstacleData.imageId === obstacle.imageId);
      if (obstacleData !== undefined) {
        let image = await firstValueFrom(this.imageService.getImg(obstacle.imageId));
        let objectURL = URL.createObjectURL(image);
        let img = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        obstacleData!.image = img;
      }
    }
  }
}
