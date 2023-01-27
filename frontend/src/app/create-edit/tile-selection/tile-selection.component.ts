import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Transform} from 'panzoom';
import {Tile} from '../tile/dto/tile.dto';
import {TilesService} from './tiles.service';

export interface Obstacle {
  name: string;
  x: number;
  y: number;

  layer: number;
}

@Component({
  selector: 'app-tile-selection',
  templateUrl: './tile-selection.component.html',
  styleUrls: ['./tile-selection.component.scss'],
})
export class TileSelectionComponent {
  tiles: Tile[] = [];
  greenTiles: Tile[] = [];

  @Output() tileSelectionChange = new EventEmitter<Tile[]>();

  @Input() canvasValues: Transform | undefined;
  @Input() innerHeight: number = 0;

  @Input() currentDraggedTile: Tile | undefined;
  @Input() evacuationExists: boolean = false;

  @Output() currentDraggedObstacle = new EventEmitter<Obstacle>;
  obstacles: Obstacle[] = [
    {
      name: 'Obstacle 1',
      x: 0,
      y: 0,
      layer: 0,
    },
    {
      name: 'Obstacle 2',
      x: 0,
      y: 0,
      layer: 0,
    },
    {
      name: 'Obstacle 3',
      x: 0,
      y: 0,
      layer: 0,
    },
    {
      name: 'Obstacle 4',
      x: 0,
      y: 0,
      layer: 0,
    },
    {
      name: 'Obstacle 5',
      x: 0,
      y: 0,
      layer: 0,
    },
  ];

  constructor(
    private tilesService: TilesService,
    private sanitizer: DomSanitizer
  ) {
  }

  ngOnInit(): void {
    this.tilesService.getTiles().subscribe((tiles: Tile[]) => {
      let loaded = 0;
      tiles.forEach((tile: Tile) => {
        this.tilesService.getTileImg(tile.imageId!).subscribe((blob: Blob) => {
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
}
