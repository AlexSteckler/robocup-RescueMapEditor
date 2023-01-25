import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Transform} from 'panzoom';
import {Tile} from '../tile/dto/tile.dto';
import {TilesService} from './tiles.service';
import {firstValueFrom} from "rxjs";

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

  constructor(
    private tilesService: TilesService,
    private sanitizer: DomSanitizer
  ) {
  }

  ngOnInit(): void {
    this.tilesService.getTiles().subscribe(async (tiles: Tile[]) => {
      for (const tile of tiles) {
        let blob = await firstValueFrom(this.tilesService.getTileImg(tile.imageId!));
        let objectURL = URL.createObjectURL(blob);
        let img = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        tile.image = img;
        tile.rotation = 0;
        this.tiles.push(tile);
      }
      this.tileSelectionChange.emit(this.tiles);
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
}
