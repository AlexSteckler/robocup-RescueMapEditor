import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Transform} from 'panzoom';
import {Tile} from '../tile/dto/tile.dto';
import {TilesService} from '../tile/tiles.service';
import {Obstacle} from "../obstacle/dto/obstacle.dto";
import {ImageService} from 'src/app/shared/image.service';
import {ObstacleService} from '../obstacle/obstacle.service';
import {firstValueFrom} from "rxjs";
import {ActivatedRoute} from '@angular/router';


@Component({
  selector: 'app-tile-selection',
  templateUrl: './tile-selection.component.html',
  styleUrls: ['./tile-selection.component.scss'],
})
export class TileSelectionComponent implements OnInit {
  tiles: Tile[] = [];
  greenTiles: Tile[] = [];
  obstacles: Obstacle[] = [];

  @Output() tileObstacleSelectionChange = new EventEmitter<{ tiles: Tile[], obstacles: Obstacle[] }>();
  @Output() obstacleSelectionChange = new EventEmitter<Obstacle[]>();

  @Input() canvasValues: Transform | undefined;
  @Input() innerHeight: number = 0;

  @Input() currentDraggedTile: Tile | undefined;
  currentDraggedObstacle: Obstacle | undefined;
  @Input() evacuationExists: boolean = false;

  @Output() currentDraggedObstacleChange = new EventEmitter<Obstacle>;


  constructor(
    private tilesService: TilesService,
    private obstacleService: ObstacleService,
    private imageService: ImageService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
  ) {
  }

  async ngOnInit() {

    this.route.params.subscribe(async (params) => {

      let loaded = 0;
      let tiles = await firstValueFrom(this.tilesService.getTilesByMapId(params['id']));

      let obstacles = await firstValueFrom(this.obstacleService.getObstacles());

      tiles.forEach((tile: Tile) => {
        this.imageService.getImg(tile.imageId!).subscribe((blob: Blob) => {
          let objectURL = URL.createObjectURL(blob);
          let img = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          tile.image = img;
          tile.rotation = 0;
          if (++loaded >= tiles.length + obstacles.length) {
            this.tileObstacleSelectionChange.emit({tiles: this.tiles, obstacles: this.obstacles});
          }
          this.tiles.push(tile);
        });
      });

      obstacles.forEach((obstacle: Obstacle) => {
        this.imageService.getImg(obstacle.imageId!).subscribe((blob: Blob) => {
          let objectURL = URL.createObjectURL(blob);
          let img = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          obstacle.image = img;
          obstacle.rotation = 0;
          if (++loaded >= tiles.length + obstacles.length) {
            this.tileObstacleSelectionChange.emit({tiles: this.tiles, obstacles: this.obstacles});
          }
          this.obstacles.push(obstacle);
        });
      });

    });
  }

  exited() {
    const currentIndex = this.tiles.findIndex(
      (tile: Tile) => tile.id === this.currentDraggedTile?.id
    );
    this.tiles.splice(currentIndex + 1, 0, {
      ...this.currentDraggedTile,
      temp: true,
    } as Tile);
  }

  entered() {
    this.tiles = this.tiles.filter((tile: Tile) => !tile.temp);
  }

  draggedStart(tile: Tile) {
    this.currentDraggedTile = tile;
  }

  draggedEnd(tile: Tile) {
    tile.temp = false;
    this.tiles = this.tiles.filter((tile: Tile) => !tile.temp);
  }

  falseEnter() {
    return false;
  }

  draggedStartObstacle(obstacle: Obstacle) {
    this.currentDraggedObstacle = obstacle;
    this.currentDraggedObstacleChange.emit(obstacle);
  }

  draggedEndObstacle(obstacle: Obstacle) {
    this.currentDraggedObstacle = undefined;
    this.currentDraggedObstacleChange.emit(undefined);
  }

  dragConstrainPoint = (point: any, dragRef: any) => {
    let zoomMoveXDifference = 0;
    let zoomMoveYDifference = 0;
    let scale = this.canvasValues!.scale;

    if (scale != 1) {
      zoomMoveXDifference = (1 - scale) * dragRef.getFreeDragPosition().x;
      zoomMoveYDifference = (1 - scale) * dragRef.getFreeDragPosition().y;
    }
    return {
      x: point.x + zoomMoveXDifference - scale * (this.currentDraggedObstacle === undefined ? 25 : this.currentDraggedObstacle.width! / 2),
      y: point.y + zoomMoveYDifference - scale * (this.currentDraggedObstacle === undefined ? 25 : this.currentDraggedObstacle.height! / 2),
    };
  }
}
