import { CdkDragDrop, CdkDragEnd } from '@angular/cdk/drag-drop';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import panzoom, { Transform } from 'panzoom';
import { Evacuation } from '../tile/dto/evacuation.dto';
import { Tile } from '../tile/dto/tile.dto';
import { Map } from '../dto/map.dto';
import { GridCanvasService } from './grid-canvas.service';

const TileCount = 30;
const OutsideDrag = 100;

@Component({
  selector: 'app-grid-canvas',
  templateUrl: './grid-canvas.component.html',
  styleUrls: ['./grid-canvas.component.scss']
})
export class GridCanvasComponent {
  @ViewChild('canvas') canvasElement: ElementRef | undefined;
  @ViewChild('canvas_wrapper') canvasWrapperElement: ElementRef | undefined;

  @Output() canvasValuesChange = new EventEmitter<Transform>;
  @Output() currentDraggedTileChange = new EventEmitter<Tile>;
  @Output() isInTrashChange = new EventEmitter<boolean>;
  @Output() evacuationExists = new EventEmitter<boolean>;

  @Input() isInTrash: boolean = false;

  map : Map | undefined;

  canvasValues: Transform | undefined;
  panzoomCanvas: any = null;
  tileIsDragged: boolean = false;
  currentDraggedTile: Tile | undefined;

  layer: number = 0;
  grids: Array<Array<Array<Tile>>> = [];

  altActive: Boolean = false;
  deleteActive: Boolean = false;

  @Input() innerHeight: number = 0;
  evacuation: Evacuation = this.getEvacuationDto(-1, -1);
  startPosition: {layer: number, x: number, y: number } = {layer: -1, x: -1, y: -1};

  totalPoints: string = '';

  constructor(private toastr: ToastrService, private gridCanvasService: GridCanvasService) {
    this.addLayer();

    //keypress event
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Control') {
        this.altActive = true;
      }
      if (event.key === 'Delete') {
        this.deleteActive = true;
      }
    });
    document.addEventListener('keyup', (event) => {
      if (event.key === 'Control') {
        this.altActive = false;
      }
      if (event.key === 'Delete') {
        this.deleteActive = false;
      }
    });
  }

  ngOnInit(): void {
    this.calcTotalPoints();

    this.gridCanvasService.createMap('test').subscribe((map) => {
      this.map = map;
      console.log(map);
    });
  }

  ngAfterViewInit() {
    this.panzoomCanvas = panzoom(this.canvasElement!.nativeElement, {
      maxZoom: 2,
      minZoom: 0.5,
    });

      this.panzoomCanvas.on('transform', (e: any) => {

      this.canvasValues = this.panzoomCanvas.getTransform();
      this.canvasValuesChange.emit(this.canvasValues);

      const nativeElement = this.canvasWrapperElement!.nativeElement;
      const scale = this.canvasValues!.scale;
      const x = this.canvasValues!.x;
      const y = this.canvasValues!.y;

      if (this.canvasValues != undefined) {
        if (this.canvasValues.scale >= 1) {
          if (x > OutsideDrag) {
            this.panzoomCanvas.moveTo(OutsideDrag, y);
          }

          if (y > OutsideDrag) {
            this.panzoomCanvas.moveTo(x, OutsideDrag);
          }

          if (x < nativeElement.offsetWidth - (TileCount * 100 * scale) - OutsideDrag) {
            this.panzoomCanvas.moveTo(nativeElement.offsetWidth - (TileCount * 100 * scale) - OutsideDrag, y);
          }

          if (y < nativeElement.offsetHeight - (TileCount * 100 * scale) - OutsideDrag) {
            this.panzoomCanvas.moveTo(x, nativeElement.offsetHeight - (TileCount * 100 * scale) - OutsideDrag);
          }
        } else {
          const reference = 500 * scale;

          if (x < TileCount * 100 * - scale + 500 * scale) {
            this.panzoomCanvas.moveTo(TileCount * 100 * - scale + 500 * scale, y);
          }

          if (y < TileCount * 100 * - scale + 500 * scale) {
            this.panzoomCanvas.moveTo(x, TileCount * 100 * - scale + 500 * scale);
          }

          if (x > nativeElement.offsetWidth - reference) {
            this.panzoomCanvas.moveTo(nativeElement.offsetWidth - reference, y);
          }

          if (y > nativeElement.offsetHeight - reference) {
            this.panzoomCanvas.moveTo(x, nativeElement.offsetHeight - reference);
          }
        }
      }
    });

    this.panzoomCanvas.setZoomSpeed(0.05);
  }

  addLayer() {
    let tempgrid :  Array<Array<Tile>> = [];

    for (let i = 0; i < TileCount; i++) {
      let row: Array<Tile> = [];
      for (let j = 0; j < TileCount; j++) {
        row.push(this.newTile());
      }
      tempgrid.push(row);
    }
    this.grids.push(tempgrid);
  }

  buttonLayerChange(direction : string) {
    if(direction == 'up' && this.layer < 5) {
      this.layer++;
      this.addLayer();

    } else if (direction == 'down' && this.layer > 0) {
      this.layer--;
    }
  }

  addPlaceholder(layer: number, rowCount: number, colCount: number, tile: Tile) {
    if (this.grids[this.grids.length + this.layer] == undefined) {
      this.addLayer()
    }
      this.grids[layer + 1][rowCount][colCount] = {...tile , isPlaceholder: true};
      if(this.layer == 1) {
        this.grids[layer -1][rowCount][colCount] = {...tile , isPlaceholder: true};
      }
  }

  tileChange(tile: Tile, rowCount: number, colCount: number) {
    this.gridCanvasService.updateTile(this.map!.id, this.layer, rowCount, colCount, tile).subscribe((map: Map) => {
      this.map = map;
    });

    this.calcTotalPoints();
    this.addPlaceholder(this.layer, rowCount, colCount, tile);
  }

  //---------- Drag & Drop -----------//

  drop($event: CdkDragDrop<Tile[]>, rowCount: number, colCount: number) {

    let tile = this.grids[this.layer][rowCount][colCount];

    if (this.grids[this.layer + 1] != undefined && this.grids[this.layer + 1][rowCount][colCount].name != '' && !this.grids[this.layer + 1][rowCount][colCount].isPlaceholder)  {
      this.toastr.warning(`Es existiert eine Kachel eine Ebene darüber`, 'Darf nicht platziert werden');
    } else if ($event.previousContainer.data && !tile.name.includes('evacuationZone') && !tile.isPlaceholder) {
      this.grids[this.layer][rowCount][colCount] = {...$event.previousContainer.data[$event.previousIndex]}
      this.addPlaceholder(this.layer,rowCount,colCount, {...$event.previousContainer.data[$event.previousIndex]});

      this.gridCanvasService.updateTile(this.map!.id, this.layer, rowCount, colCount, this.grids[this.layer][rowCount][colCount]).subscribe((map: Map) => {
        this.map = map;
      });

      if (this.grids[this.layer][rowCount][colCount].name.includes('start')) {
        if (this.startPosition.x != -1) {
          this.grids[this.startPosition.layer][this.startPosition.y][this.startPosition.x] = this.newTile();
          this.grids[this.startPosition.layer + 1][this.startPosition.y][this.startPosition.x] = this.newTile();
        }
        this.startPosition = {layer: this.layer, x: colCount, y: rowCount};
      }

    } else if ($event.previousIndex == 0 && rowCount <= TileCount - 3 && colCount <= TileCount - 4 && !tile.name.includes('evacuationZone')) {
      this.addEvacuationZoneAcross(this.layer,colCount, rowCount);
      this.evacuation = this.getEvacuationDto(colCount, rowCount);

    } else if ($event.previousIndex == 1) {
      this.addEvacuationZoneUpright(this.layer, colCount, rowCount);
      this.evacuation = this.getEvacuationDto(colCount, rowCount);
    }

    this.calcTotalPoints();
  }

  dragStartMovement(tile: Tile) {
    this.currentDraggedTile = tile;
    this.currentDraggedTileChange.emit(this.currentDraggedTile);
    tile.isBeingDragged = true;
    this.tileIsDragged = true;
    this.isInTrash = false;
    this.isInTrashChange.emit(this.isInTrash);
    if (tile.id != '0') {
      this.pausePanzoom();
    }
  }

  dragEndMovement(tile: Tile, $event: CdkDragEnd, rowCount: number, colCount: number, layerCount: number) {
    tile.isBeingDragged = false;

    let x = $event.distance.x;
    let y = $event.distance.y;

    if (Math.abs(x) > 50 || Math.abs(y) > 50) {
      const xDirection = x > 0 ? 1 : -1;
      const yDirection = y > 0 ? 1 : -1;
      x *= xDirection;
      y *= yDirection;
      x /= this.canvasValues!.scale;
      y /= this.canvasValues!.scale;

      let newX = (Math.floor((x - 50) / 100) + 1) * xDirection + colCount;
      let newY = (Math.floor((y - 50) / 100) + 1) * yDirection + rowCount;

      if (tile.name.includes('evacuationZone')) {
        this.evacuation!.position! = {x: newX, y: newY};

        let x = +tile.name.substring(tile.name.length - 2, tile.name.length - 1);
        let y = +tile.name.substring(tile.name.length - 1)

        setTimeout(() => {
          const evacuationX = tile.name.includes('Upright') ? 2 : 3;
          const evacuationY = tile.name.includes('Upright') ? 3 : 2;

          if ((newY >= 0 && newY < TileCount - evacuationY && newX >= 0 && newX < TileCount - evacuationX) || this.isInTrash) {
            this.deleteEvacuationZone(layerCount, rowCount - x, colCount - y);
            if (!this.isInTrash) {
              tile.name.includes('Upright')? this.addEvacuationZoneUpright(this.layer,newX, newY) : this.addEvacuationZoneAcross(this.layer,newX, newY)
            }
          }
        }, 10);

      } else if (
        newY >= 0 && newY < TileCount && newX >= 0 && newX < TileCount
        && !this.grids[layerCount][newY][newX].name.includes('evacuationZone')
        && !this.grids[this.layer][newY][newX].isPlaceholder) {

        if (!this.isInTrash) {
          this.grids[layerCount][newY][newX] = {...tile};
          this.addPlaceholder(layerCount, newY, newX, {...tile});

          this.gridCanvasService.updateTile(this.map!.id, this.layer, newY, newX, tile).subscribe((map: Map) => {
            this.map = map;
          });

          if (this.grids[layerCount][rowCount][colCount].name.includes('start')) {
            this.startPosition = {layer: this.layer, x: newX, y: newY};
          }
        } else if (this.grids[layerCount][rowCount][colCount].name.includes('start')) {
            this.startPosition = {layer: this.layer, x: -1, y: -1};
        }

        if (!this.altActive) {
          this.grids[layerCount][rowCount][colCount] = this.newTile();
          this.addPlaceholder(layerCount, rowCount, colCount, this.newTile());

          this.gridCanvasService.deleteTile(this.map!.id, this.layer, rowCount, colCount, this.newTile()).subscribe((map: Map) => {
            this.map = map;
          });
        }
      } else {
        setTimeout(() => {
          if (this.isInTrash) {
            if (this.grids[layerCount][rowCount][colCount].name.includes('start')) {
              this.startPosition = {layer: -1, x: -1, y: -1};
            }
            this.grids[layerCount][rowCount][colCount] = this.newTile();
            this.grids[layerCount + 1][rowCount][colCount] = this.newTile();

            this.gridCanvasService.deleteTile(this.map!.id, this.layer, rowCount, colCount, this.newTile()).subscribe((map: Map) => {
              this.map = map;
            });
          }
        }, 30);
      }
    }
    setTimeout(() => {
      this.tileIsDragged = false;
      this.calcTotalPoints();
    }, 50);
    $event.source._dragRef.reset();
    this.resumePanzoom();
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
      x: point.x + zoomMoveXDifference - scale * 50,
      y: point.y + zoomMoveYDifference - scale * 50
    };
  }

  calcTotalPoints() {
    let loopCount = 0;

    if (this.startPosition.x == -1) {
      this.totalPoints = 'Keine Startkachel gegeben';
      return;
    }

    let currentPoints = 5;
    let currentPosition = {...this.startPosition};
    let orientation = (this.grids[currentPosition.layer][currentPosition.y][currentPosition.x].rotation!
                      + this.grids[currentPosition.layer][currentPosition.y][currentPosition.x].paths!.find((path: { from: number, to: number }) => path.from === -1)!.to + 2)
                      % 4;
    this.totalPoints = currentPoints.toString();

    let multiplier : number = 1;

    while (orientation != -1 && loopCount++ <= 1000) {
      switch (orientation) {
        case 0:
          currentPosition.y += 1;
          break;
        case 1:
          currentPosition.x -= 1;
          break;

        case 2:
          currentPosition.y -= 1;
          break;

        case 3:
          currentPosition.x += 1;
          break;
      }

      if (currentPosition.x < 0 || currentPosition.y < 0 ) {
        this.totalPoints = 'Pacours führt aus dem Spielfeld';
        this.toastr.warning('Pacours führt aus dem Spielfeld');
        return;
      }
      let currentTile = this.grids[currentPosition.layer][currentPosition.y][currentPosition.x]!;
      if (!currentTile!.name || currentTile.isPlaceholder) {
        return;
      }

      if (currentTile.name.includes('evacuationZone')) {
        if (this.evacuation.entrancePosition.x != currentPosition.x ||  this.evacuation.entrancePosition.y != currentPosition.y || this.evacuation.entrancePosition.borderPosition != orientation) {
          return;
        }
        if (this.evacuation.exitPosition.x == -1) {
          return;
        }

        currentPosition = {layer: this.layer, x: this.evacuation.exitPosition.x, y: this.evacuation.exitPosition.y };
        orientation = (this.evacuation.exitPosition.borderPosition + 2) % 4;

        multiplier = 4.3904;

      } else {
        if (!currentTile.paths) {
          return;
        }

        let tileRotation = currentTile.rotation!;
        let tileWay = currentTile.paths!.find((path: { from: number, to: number, layer: number }) => orientation === (path.from + tileRotation) % 4)
        if (tileWay !== undefined) {
          currentPosition.layer += tileWay.layer;
          if (currentPosition.layer < 0) {
            this.toastr.warning('Rampe führt ins nichts!');
            return;
          }

          orientation = (tileRotation + tileWay.to + 2) % 4;
          currentPoints += currentTile.value ? currentTile.value + 5 : 5;
          this.totalPoints = Math.round(currentPoints * multiplier).toString();
        } else {
          return;
        }
      }
    }

    if (loopCount >= 1000) {
      this.totalPoints = 'Ihre Bahn erzeugt eine Schleife. Parkour nicht zugelassen!'
    }
  }

  private addEvacuationZoneAcross(layer: number, colCount: number, rowCount: number, isPlaceholder: boolean = false) {
    this.evacuation = this.getEvacuationDto(colCount, rowCount);

    this.grids[layer][rowCount][colCount] = {name: 'evacuationZoneAcross_00', border: ['black', '', '', 'black'], isPlaceholder};
    this.grids[layer][rowCount][colCount + 1] = {name: 'evacuationZoneAcross_01', border: ['black', '', '', ''], isPlaceholder};
    this.grids[layer][rowCount][colCount + 2] = {name: 'evacuationZoneAcross_02', border: ['black', '', '', ''], isPlaceholder};
    this.grids[layer][rowCount][colCount + 3] = {name: 'evacuationZoneAcross_03', border: ['black', 'black', '', ''], isPlaceholder};
    this.grids[layer][rowCount + 1][colCount + 3] = {name: 'evacuationZoneAcross_13', border: ['', 'black', '', ''], isPlaceholder};
    this.grids[layer][rowCount + 2][colCount + 3] = {name: 'evacuationZoneAcross_23', border: ['', 'black', 'black', ''], isPlaceholder};
    this.grids[layer][rowCount + 2][colCount + 2] = {name: 'evacuationZoneAcross_22', border: ['', '', 'black', ''], isPlaceholder};
    this.grids[layer][rowCount + 2][colCount + 1] = {name: 'evacuationZoneAcross_21', border: ['', '', 'black', ''], isPlaceholder};
    this.grids[layer][rowCount + 2][colCount] = {name: 'evacuationZoneAcross_20', border: ['', '', 'black', 'black'], isPlaceholder};
    this.grids[layer][rowCount + 1][colCount] = {name: 'evacuationZoneAcross_10', border: ['', '', '', 'black'], isPlaceholder};
    this.grids[layer][rowCount + 1][colCount + 1] = {name: 'evacuationZoneAcross_11', border: ['', '', '', ''], isPlaceholder};
    this.grids[layer][rowCount + 1][colCount + 2] = {name: 'evacuationZoneAcross_12', border: ['', '', '', ''], isPlaceholder};

    if(isPlaceholder == false) {
      if (this.grids[this.grids.length + layer] == undefined) {
        this.addLayer();
      }
      this.addEvacuationZoneAcross(layer + 1, colCount, rowCount, true);
    }
  }

  private addEvacuationZoneUpright(layer: number, colCount: number, rowCount: number, isPlaceholder: boolean = false) {
    this.evacuation = this.getEvacuationDto(colCount, rowCount);

    this.grids[layer][rowCount][colCount] = {name: 'evacuationZoneUpright_00', border: ['black', '', '', 'black'], isPlaceholder};
    this.grids[layer][rowCount][colCount + 1] = {name: 'evacuationZoneUpright_01', border: ['black', '', '', ''], isPlaceholder};
    this.grids[layer][rowCount][colCount + 2] = {name: 'evacuationZoneUpright_02', border: ['black', 'black', '', ''], isPlaceholder};
    this.grids[layer][rowCount + 1][colCount + 2] = {name: 'evacuationZoneUpright_12', border: ['', 'black', '', ''], isPlaceholder};
    this.grids[layer][rowCount + 2][colCount + 2] = {name: 'evacuationZoneUpright_22', border: ['', 'black', '', ''], isPlaceholder};
    this.grids[layer][rowCount + 3][colCount + 2] = {name: 'evacuationZoneUpright_32', border: ['', 'black', 'black', ''], isPlaceholder};
    this.grids[layer][rowCount + 3][colCount + 1] = {name: 'evacuationZoneUpright_31', border: ['', '', 'black', ''], isPlaceholder};
    this.grids[layer][rowCount + 3][colCount] = {name: 'evacuationZoneUpright_30', border: ['', '', 'black', 'black'], isPlaceholder};
    this.grids[layer][rowCount + 2][colCount] = {name: 'evacuationZoneUpright_20', border: ['', '', '', 'black'], isPlaceholder};
    this.grids[layer][rowCount + 1][colCount] = {name: 'evacuationZoneUpright_10', border: ['', '', '', 'black'], isPlaceholder};
    this.grids[layer][rowCount + 1][colCount + 1] = {name: 'evacuationZoneUpright_11', border: ['', '', '', ''], isPlaceholder};
    this.grids[layer][rowCount + 2][colCount + 1] = {name: 'evacuationZoneUpright_21', border: ['', '', '', ''], isPlaceholder};

    if(isPlaceholder == false) {
      if (this.grids[this.grids.length + layer] == undefined) {
        this.addLayer();
      }
      this.addEvacuationZoneUpright(layer + 1, colCount, rowCount, true);
    }
  }

  deleteEvacuationZone(layerCount: number, rowCount: number, colCount: number) {
    this.evacuation = this.getEvacuationDto(-1, -1);
    const upright: boolean = this.grids[layerCount][rowCount][colCount].name.includes('Upright');

    for (let i = 0; i < (upright ? 3 : 4); i++) {
      for (let j = 0; j < (upright ? 4 : 3); j++) {
        this.grids[layerCount][rowCount + j][colCount + i] = this.newTile();
        this.grids[layerCount + 1][rowCount + j][colCount + i] = this.newTile();
      }
    }
  }

  getEvacuationDto(x: number, y: number) {
    this.evacuationExists.emit(x == -1 ? false : true)
    return {
      position: {x, y},
      exitPlaced: false,
      entrancePlaced: false,
      alignment: 1,
      exitPosition: {x: -1, y: -1, borderPosition: -1},
      entrancePosition: {x: -1, y: -1, borderPosition: -1}
    }
  }

  newTile() {
    return {
      id: '0',
      name: '',
      imageId: '',
      image: undefined,
      paths: undefined,
      rotation: 0,
      isPlaceholder: false,
    }
  }

  pausePanzoom() {
    this.panzoomCanvas.pause();
  }

  resumePanzoom() {
    this.panzoomCanvas.resume();
  }
}
