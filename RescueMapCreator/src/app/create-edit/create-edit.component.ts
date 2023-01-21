import {Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import {CdkDragDrop, CdkDragEnd} from "@angular/cdk/drag-drop";
import {Tile} from "./tile/dto/tile.dto";
import panzoom, {Transform} from 'panzoom';
import {TilesService} from './tile/tiles.service';
import {DomSanitizer} from "@angular/platform-browser";
import {Evacuation} from './tile/dto/evacuation.dto';

@Component({
  selector: 'app-create-edit',
  templateUrl: './create-edit.component.html',
  styleUrls: ['./create-edit.component.scss']
})
export class CreateEditComponent {
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.innerHeight = window.innerHeight - 300;
  }

  evacuationExists: boolean = false;

  tiles: Tile[] = [];
  greenTiles: Tile[] = [];

  currentDraggedTile: Tile | undefined;
  canvasValues: Transform | undefined;

  innerHeight: number = 0;
  isInTrash: boolean = false;

  constructor(private tilesService: TilesService, private sanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
    this.innerHeight = window.innerHeight - 240;

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


