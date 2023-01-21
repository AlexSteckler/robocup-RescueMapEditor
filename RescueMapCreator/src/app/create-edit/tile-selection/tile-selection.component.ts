import { Component, HostListener, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Transform } from 'panzoom';
import { Tile } from '../tile/dto/tile.dto';
import { TilesService } from '../tile/tiles.service';

@Component({
  selector: 'app-tile-selection',
  templateUrl: './tile-selection.component.html',
  styleUrls: ['./tile-selection.component.scss']
})
export class TileSelectionComponent {
  tiles: Tile[] = [];
  greenTiles: Tile[] = [];

  @Input() canvasValues: Transform | undefined;
  @Input() innerHeight: number = 0;

  @Input() currentDraggedTile: Tile | undefined;
  @Input() evacuationExists: boolean = false;

  constructor(private tilesService: TilesService, private sanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
    this.tilesService.getTiles().subscribe((tiles: Tile[]) => {
      tiles.forEach((tile: Tile) => {
        this.tilesService.getTileImg(tile.source!).subscribe((blob: Blob) => {
          let objectURL = URL.createObjectURL(blob);
          let img = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          tile.image = img;
        });
        if (tile.name.includes('default') || tile.name.includes('start')) {
          this.tiles.push(tile);
        } else if (tile.name.includes('cross')) {
          this.greenTiles.push(tile);
        }
      });
    });
  }

  exited() {
    const currentIndex = this.tiles.findIndex(
      (tile: Tile) => tile.id === this.currentDraggedTile?.id
    );
    this.tiles.splice(currentIndex + 1, 0, ({
      ...this.currentDraggedTile,
      temp: true
    }) as Tile);
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
}
