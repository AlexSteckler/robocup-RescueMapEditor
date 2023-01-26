import {CdkDragDrop, CdkDragEnd} from '@angular/cdk/drag-drop';
import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild,} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import panzoom, {Transform} from 'panzoom';
import {Evacuation} from '../tile/dto/evacuation.dto';
import {Tile} from '../tile/dto/tile.dto';
import {Map} from '../dto/map.dto';
import {GridCanvasService} from './grid-canvas.service';
import {ActivatedRoute} from '@angular/router';
import {EvacuationZoneGridCanvas} from "./evacuationZone-grid-canvas";
import {ServiceGridCanvas} from "./service-grid-canvas";
import {TileServiceGridCanvas} from "./tileService.grid-canvas";

export const TileCount = 30;
export const OutsideDrag = 100;

@Component({
  selector: 'app-grid-canvas',
  templateUrl: './grid-canvas.component.html',
  styleUrls: ['./grid-canvas.component.scss'],
})
export class GridCanvasComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas') canvasElement: ElementRef | undefined;
  @ViewChild('canvas_wrapper') canvasWrapperElement: ElementRef | undefined;

  @Output() canvasValuesChange = new EventEmitter<Transform>();
  @Output() currentDraggedTileChange = new EventEmitter<Tile>();
  @Output() isInTrashChange = new EventEmitter<boolean>();
  @Output() evacuationExists = new EventEmitter<boolean>();

  @Input() isInTrash: boolean = false;
  @Input() innerHeight: number = 0;
  @Input() innerWidth: number = 0;

  map: Map | undefined;
  tileSelection: Array<Tile> = [];

  canvasValues: Transform | undefined;
  panzoomCanvas: any = null;
  currentDraggedTile: Tile | undefined;
  layer: number = 0;
  grids: Array<Array<Array<Tile>>> = [];
  controlActive: Boolean = false;
  deleteActive: Boolean = false;
  evacuationZoneGridCanvas: EvacuationZoneGridCanvas;
  evacuation: Evacuation;
  startPosition: { layer: number; x: number; y: number } = {layer: -1, x: -1, y: -1,};
  totalPoints: string = '';
  loading: boolean = true;
  serviceGridCanvas: ServiceGridCanvas;
  tileServiceGridCanvas: TileServiceGridCanvas;

  constructor(private toastr: ToastrService, private gridCanvasService: GridCanvasService, private route: ActivatedRoute) {
    this.evacuationZoneGridCanvas = new EvacuationZoneGridCanvas(this, this.gridCanvasService, this.toastr);
    this.serviceGridCanvas = new ServiceGridCanvas(this, toastr);
    this.tileServiceGridCanvas = new TileServiceGridCanvas(this, toastr);
    this.evacuation = this.evacuationZoneGridCanvas.getEvacuationDto(-1, -1, -1, true);
  }

  ngOnInit(): void {
    this.serviceGridCanvas.addLayer();
    //keypress event
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Control') this.controlActive = true;
      if (event.key === 'Delete') this.deleteActive = true;
    });
    document.addEventListener('keyup', (event) => {
      if (event.key === 'Control') this.controlActive = false;
      if (event.key === 'Delete') this.deleteActive = false;
    });

  }

  ngAfterViewInit() {
    this.panzoomCanvas = panzoom(this.canvasElement!.nativeElement, {
      maxZoom: 2,
      minZoom: 0.5,
    });
    this.panzoomCanvas.setZoomSpeed(0.05);
    this.panzoomCanvas.moveTo((-TileCount * 50), (-TileCount * 50));
    this.serviceGridCanvas.stopDragForFarAwayMoving();
  }

  loadGrid(tileSelection: Tile[]) {
    this.tileSelection = tileSelection;
    this.route.params.subscribe((params) => {
      this.gridCanvasService.getMap(params['id']).subscribe((map) => {
        this.map = map;
        this.loading = false;
        this.tileServiceGridCanvas.loadTile();
        this.evacuationZoneGridCanvas.loadEvacuation(map.evacuationZonePosition);
        this.serviceGridCanvas.calcTotalPoints();
      });
    });
  }


  buttonLayerChange(isUp: boolean) {
    if (isUp && this.layer < 5) {
      this.layer++;
      this.serviceGridCanvas.addLayer();
    } else if (!isUp && this.layer > 0) {
      this.layer--;
    }
  }

  tileChange(tile: Tile, layer: number, rowCount: number, colCount: number) {
    if (!this.grids[layer][rowCount][colCount].name.includes('evacuation')) {
      this.gridCanvasService
        .updateTile(this.map!.id, this.layer, rowCount, colCount, tile)
        .subscribe((map: Map) => this.map = map);
    }
    this.serviceGridCanvas.calcTotalPoints();
    this.tileServiceGridCanvas.addPlaceholder(this.layer, rowCount, colCount, tile);
  }

  //---------- Drag & Drop -----------//
  drop($event: CdkDragDrop<Tile[]>, layer: number, rowCount: number, colCount: number) {
    let tileToPlacedOn = this.grids[layer][rowCount][colCount];
    if (
      this.grids[this.layer + 1] != undefined &&
      this.grids[this.layer + 1][rowCount][colCount].name != '' &&
      !this.grids[this.layer + 1][rowCount][colCount].isPlaceholder
    ) {
      this.toastr.warning(`Es existiert eine Kachel eine Ebene darüber`, 'kachel darf nicht platziert werden');
      return;
    }
    if (tileToPlacedOn.name.includes('evacuation')) {
      this.toastr.warning("Platzierung auf Evakuierungszonen ist nicht erlaubt");
      return;
    }
    if (tileToPlacedOn.isPlaceholder) {
      this.toastr.warning("Platzierung auf Platzhalter ist nicht erlaubt");
      return;
    }

    if ($event.previousContainer.data) {
      //Normal Tile
      let tile = {...$event.previousContainer.data[$event.previousIndex]};
      this.grids[layer][rowCount][colCount] = tile;
      this.tileServiceGridCanvas.addPlaceholder(layer, rowCount, colCount, tile);
      this.gridCanvasService
        .updateTile(this.map!.id, layer, rowCount, colCount, tile)
        .subscribe((map: Map) => this.map = map);

      // Remove old start tileToPlacedOn if new start tileToPlacedOn is placed
      if (this.grids[layer][rowCount][colCount].name.includes('start')
        && (this.startPosition.layer != layer || this.startPosition.y != rowCount || this.startPosition.x != colCount)) {
        if (this.startPosition.layer != -1) {
          this.grids[this.startPosition.layer][this.startPosition.y][this.startPosition.x] = this.serviceGridCanvas.newTile();
          this.grids[this.startPosition.layer + 1][this.startPosition.y][this.startPosition.x] = this.serviceGridCanvas.newTile();
          if (this.startPosition.layer == 1) this.grids[this.startPosition.layer - 1][this.startPosition.y][this.startPosition.x] = this.serviceGridCanvas.newTile();

          this.gridCanvasService
            .deleteTile(this.map!.id, this.startPosition.layer, this.startPosition.y, this.startPosition.x)
            .subscribe((map: Map) => this.map = map);
        }
        this.startPosition = {layer: this.layer, x: colCount, y: rowCount};
      }
    } else if ($event.previousIndex == 0 && rowCount <= TileCount - 3 && colCount <= TileCount - 4) {
      this.evacuationZoneGridCanvas!.addEvacuationZoneAcross(this.layer, rowCount, colCount);
    } else if ($event.previousIndex == 1 && rowCount <= TileCount - 4 && colCount <= TileCount - 3) {
      this.evacuationZoneGridCanvas!.addEvacuationZoneUpright(this.layer, rowCount, colCount);
    }
    this.serviceGridCanvas.calcTotalPoints();
  }

  dragStartMovement(tile: Tile) {
    this.currentDraggedTile = tile;
    this.currentDraggedTileChange.emit(this.currentDraggedTile);
    this.isInTrash = false;
    this.isInTrashChange.emit(this.isInTrash);
    if (tile.id != '0') {
      this.panzoomCanvas.pause();
    }
  }

  dragEndMovement(tile: Tile, $event: CdkDragEnd, layerCount: number, rowCount: number, colCount: number) {
    let x = $event.distance.x / this.canvasValues!.scale;
    let y = $event.distance.y / this.canvasValues!.scale;

    //Moved out of own tile
    if (Math.abs(x) > 50 || Math.abs(y) > 50) {
      let newX = (Math.floor((Math.abs(x) - 50) / 100) + 1) * (x > 0 ? 1 : -1) + colCount;
      let newY = (Math.floor((Math.abs(y) - 50) / 100) + 1) * (y > 0 ? 1 : -1) + rowCount;

      if (tile.name.includes('evacuationZone')) {
        let x = +tile.name.substring(tile.name.length - 2, tile.name.length - 1);
        let y = +tile.name.substring(tile.name.length - 1);
        const evacuationX = tile.name.includes('Upright') ? 2 : 3;
        const evacuationY = tile.name.includes('Upright') ? 3 : 2;

        setTimeout(() => {
          if ((newY >= 0 && newY < TileCount - evacuationY && newX >= 0 && newX < TileCount - evacuationX) || this.isInTrash) {
            this.evacuationZoneGridCanvas.deleteEvacuationZone(layerCount, rowCount - x, colCount - y);
            if (!this.isInTrash) {
              let success = tile.name.includes('Upright')
                ? this.evacuationZoneGridCanvas!.addEvacuationZoneUpright(layerCount, newY, newX)
                : this.evacuationZoneGridCanvas!.addEvacuationZoneAcross(layerCount, newY, newX);
              if (!success) {
                tile.name.includes('Upright') ?
                  this.evacuationZoneGridCanvas!.addEvacuationZoneUpright(layerCount, rowCount, colCount)
                  : this.evacuationZoneGridCanvas!.addEvacuationZoneAcross(layerCount, rowCount, colCount);
              }
            }
          }
        }, 10);
      } else if (this.isInTrash) {
        if (this.grids[layerCount][rowCount][colCount].name.includes('start')) {
          this.startPosition = {layer: -1, x: -1, y: -1};
        }
        this.grids[layerCount][rowCount][colCount] = this.serviceGridCanvas.newTile();
        this.grids[layerCount + 1][rowCount][colCount] = this.serviceGridCanvas.newTile();

        this.gridCanvasService
          .deleteTile(this.map!.id, this.layer, rowCount, colCount).subscribe((map: Map) => this.map = map);
      } else if (
        newY >= 0 && newY < TileCount && newX >= 0 && newX < TileCount &&
        !this.grids[layerCount][newY][newX].name.includes('evacuationZone') &&
        !this.grids[this.layer][newY][newX].isPlaceholder
      ) {
        if (this.grids[layerCount][rowCount][colCount].name.includes('start')) {
          this.startPosition = {layer: layerCount, y: newY, x: newX};
        }
        this.grids[layerCount][newY][newX] = {...tile};
        this.tileServiceGridCanvas.addPlaceholder(layerCount, newY, newX, this.grids[layerCount][newY][newX]);

        this.gridCanvasService.updateTile(this.map!.id, this.layer, newY, newX, tile)
          .subscribe((map: Map) => this.map = map);
        if (!this.controlActive || this.grids[layerCount][rowCount][colCount].name.includes('start')) {
          this.grids[layerCount][rowCount][colCount] = this.serviceGridCanvas.newTile();
          this.grids[layerCount + 1][rowCount][colCount] = this.serviceGridCanvas.newTile();

          this.gridCanvasService.deleteTile(this.map!.id, this.layer, rowCount, colCount)
            .subscribe((map: Map) => this.map = map);
        }
      }
    }

    setTimeout(
      () => {
        this
          .serviceGridCanvas
          .calcTotalPoints();

        this
          .currentDraggedTileChange
          .emit(this

            .currentDraggedTile = undefined
          );
      },50);

    $event.source._dragRef.reset();
    this.panzoomCanvas.resume();
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
      y: point.y + zoomMoveYDifference - scale * 50,
    };
  };
  top: number = 0;
  left: number = 0;

  test($event: any) {
    let x = this.innerWidth - $event.dropPoint.x - 19
    let y = $event.dropPoint.y - 110
    let scale = this.canvasValues!.scale;
    console.log(x, this.canvasValues!.x);
    console.log(this.canvasWrapperElement!.nativeElement.getBoundingClientRect().width - x - this.canvasValues!.x);
    this.top = y -this.canvasValues!.y - 5
    this.left = this.canvasWrapperElement!.nativeElement.getBoundingClientRect().width - x - this.canvasValues!.x - 5
  }
}
