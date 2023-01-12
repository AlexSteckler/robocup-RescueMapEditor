import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {CdkDrag, CdkDragDrop, CdkDragEnd, CdkDragStart, moveItemInArray} from "@angular/cdk/drag-drop";
import {Tile} from "./tile/dto/tile.dto";
import panzoom from 'panzoom';
import {TilesService} from './tile/tiles.service';
import {DomSanitizer, Title} from "@angular/platform-browser";

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

  evacuationEnabled: boolean = true;
  tileIsDragged: boolean = false;

  tiles: Tile[] = [];
  greenTiles: Tile[] = [];

  grids: Array<Array<Array<Tile>>> = [
    [],
  ];
  private currentDraggedTile: Tile | undefined;

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
        this.tilesService.getTileImg(tile.source!).subscribe((blob: Blob) => {
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

  drop($event: CdkDragDrop<Tile[]>, rowCount: number, colCount: number) {
    if ($event.previousContainer.data && !this.grids[0][rowCount][colCount].name.includes('evacuationZone')) {
      this.grids[0][rowCount][colCount] = {...$event.previousContainer.data[$event.previousIndex]}
    } else if ($event.previousIndex == 0 && rowCount <= TileCount - 3 && colCount <= TileCount - 4 && !this.grids[0][rowCount][colCount].name.includes('evacuationZone')) {
      this.addEvacuationZone(rowCount, colCount);
      this.evacuationEnabled = false;
    } else if ($event.previousIndex == 1) {

    }
  }

  pausePanzoom() {
    this.panzoomCanvas.pause();
  }

  resumePanzoom() {
    this.panzoomCanvas.resume();
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

  dragStartMovement(tile: Tile, $event: CdkDragStart, rowCount: number, colCount: number, levelCount: number) {
    tile.isBeingDragged = true;
    if (tile.id != '0') {
      this.pausePanzoom();
    }
  }

  dragEndMovement(tile: Tile, $event: CdkDragEnd, rowCount: number, colCount: number, levelCount: number) {
    tile.isBeingDragged = false;
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

      if (rowCount + yMove >= 0
        && rowCount + yMove < TileCount - 2
        && colCount + xMove >= 0
        && colCount + xMove < TileCount - 3
        && tile.name.includes('evacuationZone')
        ) {
        let x = +tile.name.substring(tile.name.length - 2, tile.name.length - 1);
        let y = +tile.name.substring(tile.name.length - 1);

        for (let i = 0; i < 4; i++ ) {
          for (let j = 0; j < 3; j++) {
            this.grids[levelCount][rowCount + j - x][colCount + i - y] = {
              id: '0',
              name: '',
              source: '',
              image: undefined,
              paths: undefined,
              rotation: 0,
            }
          }
        }

        this.addEvacuationZone(rowCount + yMove, colCount + xMove);
      }

      else if (
              rowCount + yMove >= 0
              && rowCount + yMove < TileCount
              && colCount + xMove >= 0
              && colCount + xMove < TileCount
              && !tile.name.includes('evacuationZone')
              ) {
        this.grids[levelCount][rowCount + yMove][colCount + xMove] = {
          ...tile
        }
        this.grids[levelCount][rowCount][colCount] = {
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

  private addEvacuationZone(rowCount: number, colCount: number) {
    this.grids[0][rowCount][colCount] = { name: 'evacuationZone_00', border: ['black', '', '', 'black'] };
    this.grids[0][rowCount][colCount + 1] = { name: 'evacuationZone_01', border: ['black', '', '', ''] };
    this.grids[0][rowCount][colCount + 2] = { name: 'evacuationZone_02', border: ['black', '', '', ''] };
    this.grids[0][rowCount][colCount + 3] = { name: 'evacuationZone_03', border: ['black', 'black', '', ''] };
    this.grids[0][rowCount + 1][colCount + 3] = { name: 'evacuationZone_13', border: ['', 'black', '', ''] };
    this.grids[0][rowCount + 2][colCount + 3] = { name: 'evacuationZone_23', border: ['', 'black', 'black', ''] };
    this.grids[0][rowCount + 2][colCount + 2] = { name: 'evacuationZone_22', border: ['', '', 'black', ''] };
    this.grids[0][rowCount + 2][colCount + 1] = { name: 'evacuationZone_21', border: ['', '', 'black', ''] };
    this.grids[0][rowCount + 2][colCount] = { name: 'evacuationZone_20', border: ['', '', 'black', 'black'] };
    this.grids[0][rowCount + 1][colCount] = { name: 'evacuationZone_10', border: ['', '', '', 'black'] };
    this.grids[0][rowCount + 1][colCount + 1] = { name: 'evacuationZone_11', border: ['', '', '', ''] };
    this.grids[0][rowCount + 1][colCount + 2] = { name: 'evacuationZone_12', border: ['', '', '', ''] };
  }
}
