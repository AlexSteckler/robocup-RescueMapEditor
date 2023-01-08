import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {CdkDrag, CdkDragDrop, CdkDragEnd, moveItemInArray} from "@angular/cdk/drag-drop";
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

  @Input() zoomScale = 1;
  @Input() pos = { x: 0, y: 0 };

  @Output() dragStart = new EventEmitter<any>();
  @Output() dragEnd = new EventEmitter<any>();
  @Input() tile: Tile | undefined;

  zoomFactor = 0.05;
  panzoomCanvas: any = null;

  tiles: Tile[] = [];
  greenTiles: Tile[] = [];

  grids: Array<Array<Array<Tile>>> = [
    [],
  ];
  private currentDraggedTile: Tile | undefined;

  drop($event: CdkDragDrop<Tile[]>, rowCount: number, colCount: number) {
    this.grids[0][rowCount][colCount] = {...$event.previousContainer.data[$event.previousIndex]}
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
    ;this.panzoomCanvas.resume();
  }

  exited(event: any) {
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

  draggedStart(tile: Tile) {
    this.currentDraggedTile = tile;
  }

  draggedEnd(tile: Tile) {
    tile.temp = false;
    this.tiles = this.tiles.filter((f: any) => !f.temp);
  }

  dragStartMovement(tile: Tile) {
    if (tile.id != '0') {
      this.pausePanzoom();
    }
  }

  dragEndMovement(tile: Tile, $event: CdkDragEnd, rowCount: number, colCount: number, layerCount: number) {
    let zoomFactor = this.panzoomCanvas.getTransform().scale;
    let x = $event.distance.x;
    let y = $event.distance.y;
    if (Math.abs(x) > 50 || Math.abs(y) > 50) {
      const xDirection = x > 0 ? 1 : -1;
      const yDirection = y > 0 ? 1 : -1;
      x *= xDirection;
      y *= yDirection;
      x /= zoomFactor;
      y /= zoomFactor;
      let xMove = (Math.floor((x - 50) / 100) + 1) * xDirection
      let yMove = (Math.floor((y - 50) / 100) + 1) * yDirection
      if (rowCount + yMove >= 0 && rowCount + yMove < TileCount && colCount + xMove >= 0 && colCount + xMove < TileCount) {
        this.grids[layerCount][rowCount + yMove][colCount + xMove] = {
          ...tile
        }
        this.grids[layerCount][rowCount][colCount] = {
          id: '0',
          name: '',
          source: '',
          image: undefined,
          paths: undefined,
          rotation: 0,
        }
      }
    }
    $event.source._dragRef.reset();
    this.resumePanzoom();
  }

  dragConstrainPoint = (point : any, dragRef: any) => {

    let zoomMoveXDifference = 0;
    let zoomMoveYDifference = 0;
    ;

    if (this.zoomScale != 1) {
      console.log(this.zoomScale);
      zoomMoveXDifference = (1 - this.zoomScale) * dragRef.getFreeDragPosition().x;
      zoomMoveYDifference = (1 - this.zoomScale) * dragRef.getFreeDragPosition().y;
    }
    return {
      x: point.x + zoomMoveXDifference - this.zoomScale * 50,
      y: point.y + zoomMoveYDifference - this.zoomScale * 50
    };
  };

  startDragging($event : any) {
    this.dragStart.emit();
  }
}
