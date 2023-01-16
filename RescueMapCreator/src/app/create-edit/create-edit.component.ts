import {Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild} from '@angular/core';
import {CdkDrag, CdkDragDrop, CdkDragEnd, CdkDragStart} from "@angular/cdk/drag-drop";
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
  @Input() pos = {x: 0, y: 0};

  @Output() dragStart = new EventEmitter<any>();
  @Output() dragEnd = new EventEmitter<any>();
  @Input() tile: Tile | undefined;

  public innerHeight: any;

  altActive: Boolean = false;
  deleteActive: Boolean = false;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.innerHeight = window.innerHeight - 240;
  }

  zoomFactor = 0.05;
  panzoomCanvas: any = null;

  evacuationEnabled: boolean = true;
  tileIsDragged: boolean = false;
  isInTrash: boolean = false;

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
    //keypress event
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Control'){
        this.altActive = true;
      }
      if (event.key === 'Delete'){
        this.deleteActive = true;
      }
    });
    document.addEventListener('keyup', (event) => {
      if (event.key === 'Control'){
        this.altActive = false;
      }
      if (event.key === 'Delete'){
        this.deleteActive = false;
      }
    });
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
      this.addEvacuationZoneAcross(rowCount, colCount);
      this.evacuationEnabled = false;
    } else if ($event.previousIndex == 1) {
      this.addEvacuationZoneUpright(rowCount, colCount)
      this.evacuationEnabled = false;
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
    this.tileIsDragged = true;
    this.isInTrash = false;
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

      if (tile.name.includes('evacuationZone')) {
        //delay to allow the tile to be removed from the grid

            let x = +tile.name.substring(tile.name.length - 2, tile.name.length - 1);
            let y = +tile.name.substring(tile.name.length - 1)
            setTimeout(() => {
              if (((rowCount + yMove >= 0
                && rowCount + yMove < TileCount - 3
                && colCount + xMove >= 0
                && colCount + xMove < TileCount - 4)
                || this.isInTrash)
                && tile.name.includes('Upright')
              ) {
                for (let i = 0; i < 3; i++) {
                  for (let j = 0; j < 4; j++) {
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
                if (!this.isInTrash) {
                  this.addEvacuationZoneUpright(rowCount + yMove, colCount + xMove);
                } else {
                  this.evacuationEnabled = true;
                }
              }

              if (((rowCount + yMove >= 0
                && rowCount + yMove < TileCount - 2
                && colCount + xMove >= 0
                && colCount + xMove < TileCount - 3)
                || this.isInTrash)
                && tile.name.includes('Across')
              ) {
                for (let i = 0; i < 4; i++) {
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
                if (!this.isInTrash) {
                  this.addEvacuationZoneAcross(rowCount + yMove, colCount + xMove);
                } else {
                  this.evacuationEnabled = true;
                }
              }
            }, 10);


      } else if (
        rowCount + yMove >= 0
        && rowCount + yMove < TileCount
        && colCount + xMove >= 0
        && colCount + xMove < TileCount
        && !this.grids[levelCount][rowCount + yMove][colCount + xMove].name.includes('evacuationZone')
      ) {
        if (!this.isInTrash) {
          this.grids[levelCount][rowCount + yMove][colCount + xMove] = {
            ...tile
          }
        }
        if(!this.altActive) {
          this.grids[levelCount][rowCount][colCount] = {
            id: '0',
            name: '',
            source: '',
            image: undefined,
            paths: undefined,
            rotation: 0,
          }
        }

      } else {
        setTimeout(() => {
          if (this.isInTrash) {
            this.grids[levelCount][rowCount][colCount] = {
              id: '0',
              name: '',
              source: '',
              image: undefined,
              paths: undefined,
              rotation: 0,
            }
          }
        }, 50);
      }
    }
    setTimeout(() => {
      this.tileIsDragged = false;
    }, 50);
    $event.source._dragRef.reset();
    this.resumePanzoom();
  }

  dragConstrainPoint = (point: any, dragRef: any) => {

    let zoomMoveXDifference = 0;
    let zoomMoveYDifference = 0;
    
    if (this.zoomScale != 1) {
      zoomMoveXDifference = (1 - this.zoomScale) * dragRef.getFreeDragPosition().x;
      zoomMoveYDifference = (1 - this.zoomScale) * dragRef.getFreeDragPosition().y;
    }
    return {
      x: point.x + zoomMoveXDifference - this.zoomScale * 50,
      y: point.y + zoomMoveYDifference - this.zoomScale * 50
    };
  };

  startDragging($event: any) {
    this.dragStart.emit();
  }

  private addEvacuationZoneAcross(rowCount: number, colCount: number) {
    this.grids[0][rowCount][colCount] = {name: 'evacuationZoneAcross_00', border: ['black', '', '', 'black']};
    this.grids[0][rowCount][colCount + 1] = {name: 'evacuationZoneAcross_01', border: ['black', '', '', '']};
    this.grids[0][rowCount][colCount + 2] = {name: 'evacuationZoneAcross_02', border: ['black', '', '', '']};
    this.grids[0][rowCount][colCount + 3] = {name: 'evacuationZoneAcross_03', border: ['black', 'black', '', '']};
    this.grids[0][rowCount + 1][colCount + 3] = {name: 'evacuationZoneAcross_13', border: ['', 'black', '', '']};
    this.grids[0][rowCount + 2][colCount + 3] = {name: 'evacuationZoneAcross_23', border: ['', 'black', 'black', '']};
    this.grids[0][rowCount + 2][colCount + 2] = {name: 'evacuationZoneAcross_22', border: ['', '', 'black', '']};
    this.grids[0][rowCount + 2][colCount + 1] = {name: 'evacuationZoneAcross_21', border: ['', '', 'black', '']};
    this.grids[0][rowCount + 2][colCount] = {name: 'evacuationZoneAcross_20', border: ['', '', 'black', 'black']};
    this.grids[0][rowCount + 1][colCount] = {name: 'evacuationZoneAcross_10', border: ['', '', '', 'black']};
    this.grids[0][rowCount + 1][colCount + 1] = {name: 'evacuationZoneAcross_11', border: ['', '', '', '']};
    this.grids[0][rowCount + 1][colCount + 2] = {name: 'evacuationZoneAcross_12', border: ['', '', '', '']};
  }

  private addEvacuationZoneUpright(rowCount: number, colCount: number) {
    this.grids[0][rowCount][colCount] = {name: 'evacuationZoneUpright_00', border: ['black', '', '', 'black']};
    this.grids[0][rowCount][colCount + 1] = {name: 'evacuationZoneUpright_01', border: ['black', '', '', '']};
    this.grids[0][rowCount][colCount + 2] = {name: 'evacuationZoneUpright_02', border: ['black', 'black', '', '']};
    this.grids[0][rowCount + 1][colCount + 2] = {name: 'evacuationZoneUpright_12', border: ['', 'black', '', '']};
    this.grids[0][rowCount + 2][colCount + 2] = {name: 'evacuationZoneUpright_22', border: ['', 'black', '', '']};
    this.grids[0][rowCount + 3][colCount + 2] = {name: 'evacuationZoneUpright_32', border: ['', 'black', 'black', '']};
    this.grids[0][rowCount + 3][colCount + 1] = {name: 'evacuationZoneUpright_31', border: ['', '', 'black', '']};
    this.grids[0][rowCount + 3][colCount] = {name: 'evacuationZoneUpright_30', border: ['', '', 'black', 'black']};
    this.grids[0][rowCount + 2][colCount] = {name: 'evacuationZoneUpright_20', border: ['', '', '', 'black']};
    this.grids[0][rowCount + 1][colCount] = {name: 'evacuationZoneUpright_10', border: ['', '', '', 'black']};
    this.grids[0][rowCount + 1][colCount + 1] = {name: 'evacuationZoneUpright_11', border: ['', '', '', '']};
    this.grids[0][rowCount + 2][colCount + 1] = {name: 'evacuationZoneUpright_21', border: ['', '', '', '']};
  }

  enterTrash() {
    this.isInTrash = true;
  }

  outTrash() {
    this.isInTrash = false;
  }

  falseEnter() {
    return false;
  }
}
