
import {Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {CdkDrag, CdkDragDrop, CdkDragStart, moveItemInArray} from "@angular/cdk/drag-drop";
import {Tile} from "./tile/dto/tile.dto";
import panzoom from 'panzoom';
import {TilesService} from './tile/tiles.service';
import {DomSanitizer} from "@angular/platform-browser";


const TileCount = 30;
const OutsideDrag = 100;


@Component({
  selector: 'app-create-edit',
  templateUrl: './create-edit.component.html',
  styleUrls: ['./create-edit.component.scss']
})
export class CreateEditComponent {
  @ViewChild('canvas') canvasElement: ElementRef | undefined;
  @ViewChild('canvas_wrapper') canvasWrapperElement: ElementRef | undefined;

  zoomScale = 1;
  zoomFactor = 0.05;
  panzoomCanvas: any = null;

  tiles: Tile[] = [];
  greenTiles: Tile[] = [];

  grids: Array<Array<Array<Tile>>> = [
    [],
  ];
  private currentDraggedTile: Tile | undefined;
  moveEnabled: any;

  drop($event: CdkDragDrop<Tile[]>, rowCount: number, colCount: number) {
    this.grids[0][rowCount][colCount] = $event.previousContainer.data[$event.previousIndex]
  }

  constructor(private tilesService: TilesService,
              private sanitizer: DomSanitizer) {
    for (let i = 0; i < TileCount; i++) {
      let row: Array<Tile> = [];
      for (let j = 0; j < TileCount; j++) {
        row.push({
          id: '0',
          name: 'null',
          source: '',
          image: undefined,
          paths: undefined,
          rotation: 0,
        });
      }
      this.grids[0].push(row);
    }
  }

  ngOnInit(): void {
    this.tilesService.getTiles().subscribe((tiles: Tile[]) => {
      tiles.forEach((tile: Tile) => {
        this.tilesService.getTileImg(tile.source).subscribe((blob: Blob) => {
          let objectURL = URL.createObjectURL(blob);
          let img = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          tile.image = img;
        });
        if (tile.name.includes('default')) {
          this.tiles.push(tile);
        } else if (tile.name.includes('cross')) {
          this.greenTiles.push(tile);
        }
      });
    });
  }

  ngAfterViewInit() {

    this.panzoomCanvas = panzoom(this.canvasElement!.nativeElement, {
      maxZoom: 2,
      minZoom: 0.5,
    });

    if (this.panzoomCanvas != null) {
      this.panzoomCanvas.on('transform', (e: any) => {

        let result = this.panzoomCanvas.getTransform();

        if(!this.moveEnabled) {
          return;
        }

        if (result.scale >= 1) {
          if (result.x > OutsideDrag) {
            this.panzoomCanvas.moveTo(OutsideDrag, result.y);
          }

          if (result.y > OutsideDrag) {
            this.panzoomCanvas.moveTo(result.x, OutsideDrag);
          }

          if (result.x < this.canvasWrapperElement?.nativeElement.offsetWidth - (TileCount * 100 * result.scale) - OutsideDrag) {
            this.panzoomCanvas.moveTo(this.canvasWrapperElement?.nativeElement.offsetWidth - (TileCount * 100 * result.scale) - OutsideDrag, result.y);
          }

          if (result.y < this.canvasWrapperElement?.nativeElement.offsetHeight - (TileCount * 100 * result.scale) - OutsideDrag) {
            this.panzoomCanvas.moveTo(result.x, this.canvasWrapperElement?.nativeElement.offsetHeight - (TileCount * 100 * result.scale) - OutsideDrag);
          }
        } else {
          const reference = 500 * result.scale;

          if (result.x < TileCount * 100 * -result.scale + 500 * result.scale) {
            this.panzoomCanvas.moveTo(TileCount * 100 * -result.scale + 500 * result.scale, result.y);
          }

          if (result.y < TileCount * 100 * -result.scale + 500 * result.scale) {
            this.panzoomCanvas.moveTo(result.x, TileCount * 100 * -result.scale + 500 * result.scale);
          }

          if (result.x > this.canvasWrapperElement?.nativeElement.offsetWidth - reference) {
            this.panzoomCanvas.moveTo(this.canvasWrapperElement?.nativeElement.offsetWidth - reference, result.y);
          }

          if (result.y > this.canvasWrapperElement?.nativeElement.offsetHeight - reference) {
            this.panzoomCanvas.moveTo(result.x, this.canvasWrapperElement?.nativeElement.offsetHeight - reference);
          }
        }

        this.zoomScale = result.scale;
      });
    }
    this.panzoomCanvas.setZoomSpeed(0.05);
  }

  pausePanzoom() {
    this.panzoomCanvas.pause();
  }

  resumePanzoom() {
;    this.panzoomCanvas.resume();
  }

  exited(event: any) {
    console.log('exited');
    const currentIdx = this.tiles.findIndex(
      (tile: Tile) => tile.id === this.currentDraggedTile?.id
    );
    this.tiles.splice(currentIdx + 1, 0, ({
      ...this.currentDraggedTile,
      temp: true
    }) as Tile);
  }

  entered() {
    this.tiles = this.tiles.filter((f: any) => !f.temp);
  }

  dragStart(tile: Tile) {
    this.currentDraggedTile = tile;
  }

  dragEnd(tile: Tile) {
    tile.temp = false;
    this.tiles = this.tiles.filter((f: any) => !f.temp);
  }

  dragStartMovement(tile: Tile) {
    if(tile.id != '0') {
      this.pausePanzoom();
    }
  }

  dragEndMovement(tile: Tile) {
      this.moveEnabled = true;
  }

  dropped(event: any) {
    console.log('dropped');
    moveItemInArray(
       this.tiles,
       event.previousIndex,
       event.currentIndex
      );
  }

  dragged(event: any) {
    console.log(event);
  }
}
