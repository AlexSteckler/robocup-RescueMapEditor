import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Transform} from 'panzoom';
import {Tile} from '../tile/dto/tile.dto';
import {TilesService} from '../tile/tiles.service';
import {Obstacle} from "../obstacle/dto/obstacle.dto";
import { ImageService } from 'src/app/shared/image.service';
import { ObstacleService } from '../obstacle/obstacle.service';


@Component({
  selector: 'app-tile-selection',
  templateUrl: './tile-selection.component.html',
  styleUrls: ['./tile-selection.component.scss'],
})
export class TileSelectionComponent implements OnInit{
  tiles: Tile[] = [];
  greenTiles: Tile[] = [];
  obstacles: Obstacle[] = [];

  @Output() tileSelectionChange = new EventEmitter<Tile[]>();

  @Input() canvasValues: Transform | undefined;
  @Input() innerHeight: number = 0;

  @Input() currentDraggedTile: Tile | undefined;
  @Input() evacuationExists: boolean = false;

  @Output() currentDraggedObstacle = new EventEmitter<Obstacle>;


  constructor(
    private tilesService: TilesService,
    private obstacleService: ObstacleService,
    private imageService: ImageService,
    private sanitizer: DomSanitizer
  ) {
  }

  ngOnInit(): void {
    this.tilesService.getTiles().subscribe((tiles: Tile[]) => {
      let loaded = 0;
      tiles.forEach((tile: Tile) => {
        this.imageService.getImg(tile.imageId!).subscribe((blob: Blob) => {
          let objectURL = URL.createObjectURL(blob);
          let img = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          tile.image = img;
          tile.rotation = 0;
          loaded++;
          if (loaded === tiles.length) {
            this.tileSelectionChange.emit(this.tiles);
          }
          this.tiles.push(tile);
        });

      });
    });

    this.obstacleService.getObstacles().subscribe((obstacles: Obstacle[]) => {

      obstacles.forEach((obstacle: any) => {
        console.log(obstacle.scale)
        let loaded = 0;
        this.imageService.getImg(obstacle.imageId!).subscribe((blob: Blob) => {
          if(obstacle.imageInfo) {
            blob = new File([blob], "noMatter.svg", {type: obstacle.imageInfo.contentType});
          }

          let objectURL = URL.createObjectURL(blob);
          let img = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          obstacle.image = img;
          obstacle.rotation = 0;
          loaded++;
          if (loaded === obstacles.length) {
            this.tileSelectionChange.emit(this.tiles);
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
     this.currentDraggedObstacle.emit(obstacle);
  }

  draggedEndObstacle(obstacle: Obstacle) {
    this.currentDraggedObstacle.emit(undefined);
  }
}
