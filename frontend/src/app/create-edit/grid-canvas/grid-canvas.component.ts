import {CdkDragDrop, CdkDragEnd} from '@angular/cdk/drag-drop';
import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild,} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import panzoom, {Transform} from 'panzoom';
import {Evacuation} from '../dto/evacuation.dto';
import {Tile} from '../tile/dto/tile.dto';
import {Map} from '../dto/map.dto';
import {GridCanvasService} from './grid-canvas.service';
import {ActivatedRoute, Router} from '@angular/router';
import {EvacuationZoneGridCanvas} from "./evacuationZone-grid-canvas";
import {ServiceGridCanvas} from "./service-grid-canvas";
import {TileObstacleServiceGridCanvas} from "./tile-obstacle-service.grid-canvas";
import {Obstacle} from "../obstacle/dto/obstacle.dto";
import {ImageService} from 'src/app/shared/image.service';
import {DomSanitizer} from '@angular/platform-browser';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

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
  @ViewChild('basicModal') basicModal: ElementRef | undefined;

  @Output() canvasValuesChange = new EventEmitter<Transform>();
  @Output() currentDraggedTileChange = new EventEmitter<Tile>();
  @Output() isInTrashChange = new EventEmitter<boolean>();
  @Output() evacuationExists = new EventEmitter<boolean>();

  @Input() isInTrash: boolean = false;
  @Input() innerHeight: number = 0;
  @Input() innerWidth: number = 0;
  @Input() isObstacleMoving: boolean = false;

  @Input() currentObstacle: Obstacle | undefined;

  map: Map | undefined;

  showMode = false;

  tileSelection: Array<Tile> = [];
  obstacles: Obstacle[] = [];

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
  tileObstacleServiceGridCanvas: TileObstacleServiceGridCanvas;

  mouseEvent: any;
  private yCorrection: number = 0;
  private xCorrection: number = 0

  constructor(
    private toastr: ToastrService,
    private gridCanvasService: GridCanvasService,
    private imageService: ImageService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private router: Router,
    private modalService: NgbModal,
  ) {
    this.evacuationZoneGridCanvas = new EvacuationZoneGridCanvas(this, this.gridCanvasService, this.toastr);
    this.serviceGridCanvas = new ServiceGridCanvas(this, this.gridCanvasService, toastr);
    this.tileObstacleServiceGridCanvas = new TileObstacleServiceGridCanvas(this, this.toastr, modalService, this.gridCanvasService);
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

    //get mouse position
    this.canvasWrapperElement!.nativeElement.addEventListener('mousedown', (event: any) => {
      this.mouseEvent = event;
    });

    this.panzoomCanvas = panzoom(this.canvasElement!.nativeElement, {
      maxZoom: 1.9,
      minZoom: 0.5,
      zoomDoubleClickSpeed: 1,
    });

    this.panzoomCanvas.setZoomSpeed(0.05);
    this.panzoomCanvas.moveTo((-TileCount * 50), (-TileCount * 50));
    this.serviceGridCanvas.stopDragForFarAwayMoving();
  }

  loadGrid(tilesObstacle: { tiles: Tile[], obstacles: Obstacle[] }) {
    this.tileSelection = tilesObstacle.tiles;
    this.route.params.subscribe((params) => {
      this.gridCanvasService.getMap(params['id']).subscribe((map) => {
        this.map = map;
        this.loading = false;
        this.tileObstacleServiceGridCanvas.loadTile();

        this.tileObstacleServiceGridCanvas.loadObstacle(tilesObstacle.obstacles);

        this.evacuationZoneGridCanvas.loadEvacuation(map.evacuationZonePosition);
        this.serviceGridCanvas.calcTotalPoints();
      }, (error) => {
        this.toastr.error('Map wurde nicht gefunden');
        this.router.navigate(['']);
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
    this.tileObstacleServiceGridCanvas.addPlaceholder(this.layer, rowCount, colCount, tile);
  }

  //---------- Drag & Drop -----------//
  drop($event: CdkDragDrop<Tile[]>, layer: number, rowCount: number, colCount: number) {
    if (this.currentObstacle !== undefined) {
      console.log(this.canvasWrapperElement?.nativeElement.getBoundingClientRect());
      let x = this.innerWidth - $event.dropPoint.x
      let y = $event.dropPoint.y - this.canvasWrapperElement?.nativeElement.getBoundingClientRect().top;
      let scale = this.canvasValues!.scale;
      let top = (y - this.canvasValues!.y) / scale - this.currentObstacle.height / 2;
      let left = (this.canvasWrapperElement!.nativeElement.getBoundingClientRect().width - x - this.canvasValues!.x) / scale - (3 * scale);

      if (top < 0 || left < 0) {
        return;
      }

      let tmpId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      let tmpObstacle = {
        id: tmpId,
        imageId: this.currentObstacle.imageId,
        layer: this.layer,
        x: left,
        y: top,
        rotation: 0,
        width: this.currentObstacle.width,
        height: this.currentObstacle.height,
        image: this.currentObstacle.image,
        name: this.currentObstacle.name,
        value: this.currentObstacle.value,
      }

      let centerObstacle = {x: tmpObstacle.x + tmpObstacle.width! / 2, y: tmpObstacle.y + tmpObstacle.height! / 2};

      //check on which tile is obstacle in grid
      let colX = Math.floor(centerObstacle.x / 100);
      let rowY = Math.floor(centerObstacle.y / 100);

      if ((
        (this.grids[this.layer][rowY][colX].value && this.grids[this.layer][rowY][colX].value! > 0 && this.map?.discipline.includes('Line Entry'))
        || this.obstacles.find(obstacleFind => Math.floor(obstacleFind.x / 100) == colX
          && Math.floor(obstacleFind.y / 100) == rowY
          && obstacleFind.name?.includes('Checkpoint')
          && tmpObstacle.id != obstacleFind.id) != undefined
        || tmpObstacle.name?.includes('Checkpoint')
        && this.obstacles.find(obstacleFind => Math.floor(obstacleFind.x / 100) == colX
          && Math.floor(obstacleFind.y / 100) == rowY
          && tmpObstacle.id != obstacleFind.id) != undefined
        || this.grids[this.layer][rowY][colX].name?.includes('start')
      )
      ) {
        this.toastr.info(`${tmpObstacle.name?.toLowerCase()?.includes('checkpoint') ? "Checkpoints" : "Obstacles"} dürfen sich nicht auf Kacheln mit Wertungselementen befinden`)
      } else {

        this.obstacles.push((tmpObstacle) as Obstacle);
        this.gridCanvasService.updateObstacle(
          this.map!.id,
          tmpObstacle
        ).subscribe((map: Map) => this.map = map);
        this.serviceGridCanvas.calcTotalPoints();
      }
      return;
    }
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
      if (this.grids[layer][rowCount][colCount].name.includes('start')) {
        this.startPosition = {layer: -1, y: -1, x: -1};
      }
      this.grids[layer][rowCount][colCount] = tile;
      this.tileObstacleServiceGridCanvas.addPlaceholder(layer, rowCount, colCount, tile);
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
    if (tile.isPlaceholder) return;
    this.currentDraggedTile = tile;
    this.currentDraggedTileChange.emit(this.currentDraggedTile);
    this.isInTrash = false;
    this.isInTrashChange.emit(this.isInTrash);
    if (tile.id != '0') {
      this.panzoomCanvas.pause();
    }
  }

  dragEndMovement(tile: Tile, $event: CdkDragEnd, layerCount: number, rowCount: number, colCount: number) {
    if (tile.isPlaceholder) return;
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
        if (layerCount == 1) this.grids[layerCount - 1][rowCount][colCount] = this.serviceGridCanvas.newTile();

        this.gridCanvasService
          .deleteTile(this.map!.id, this.layer, rowCount, colCount).subscribe((map: Map) => this.map = map);
      } else if (
        newY >= 0 && newY < TileCount && newX >= 0 && newX < TileCount &&
        !this.grids[layerCount][newY][newX].name.includes('evacuationZone') &&
        !this.grids[this.layer][newY][newX].isPlaceholder
      ) {
        if (this.grids[layerCount][newY][newX].name.includes('start')) {
          this.startPosition = {layer: -1, x: -1, y: -1};
        }
        if (this.grids[layerCount][rowCount][colCount].name.includes('start')) {
          this.startPosition = {layer: layerCount, y: newY, x: newX};
        }
        this.grids[layerCount][newY][newX] = {...tile};
        this.tileObstacleServiceGridCanvas.addPlaceholder(layerCount, newY, newX, this.grids[layerCount][newY][newX]);

        this.gridCanvasService.updateTile(this.map!.id, this.layer, newY, newX, tile)
          .subscribe((map: Map) => this.map = map);
        if (!this.controlActive || this.grids[layerCount][rowCount][colCount].name.includes('start')) {
          this.grids[layerCount][rowCount][colCount] = this.serviceGridCanvas.newTile();
          this.grids[layerCount + 1][rowCount][colCount] = this.serviceGridCanvas.newTile();
          if (layerCount == 1) this.grids[layerCount - 1][rowCount][colCount] = this.serviceGridCanvas.newTile();

          this.gridCanvasService.deleteTile(this.map!.id, this.layer, rowCount, colCount)
            .subscribe((map: Map) => this.map = map);
        } else {
          this.grids[layerCount][rowCount][colCount].rotation! = (this.grids[layerCount][rowCount][colCount].rotation! - 1) % 4;
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
      }, 50);

    $event.source._dragRef.reset();
    this.panzoomCanvas.resume();
  }

  dragConstrainPoint = (point: any, dragRef: any) => {
    let scale = this.canvasValues!.scale;
    let zoomMoveXDifference = Math.floor((1 - scale) * dragRef.getFreeDragPosition().x);
    let zoomMoveYDifference = Math.floor((1 - scale) * dragRef.getFreeDragPosition().y);
    if(this.currentObstacle !== undefined) {
      return {
        x: Math.floor(point.x + zoomMoveXDifference - scale *  (this.currentObstacle.width / 2)),
        y: Math.floor(point.y + zoomMoveYDifference - scale *  (this.currentObstacle.height / 2)),
      };
    } else {
      return {
        x: Math.floor(point.x + zoomMoveXDifference - scale * 50),
        y: Math.floor(point.y + zoomMoveYDifference - scale * 50),
      };
    }
  }

  moveObsStart(obstacle: Obstacle) {
    let x = this.mouseEvent.x - this.innerWidth + this.canvasWrapperElement?.nativeElement.getBoundingClientRect().width + 16;
    let y = this.mouseEvent.y - this.canvasWrapperElement?.nativeElement.getBoundingClientRect().top;
    this.xCorrection = Math.floor((x - this.canvasValues!.x) / this.canvasValues!.scale - (obstacle.x + obstacle.width! / 2));
    this.yCorrection = Math.floor((y - this.canvasValues!.y) / this.canvasValues!.scale - (obstacle.y + obstacle.height! / 2));

    this.currentObstacle = obstacle;
    this.panzoomCanvas.pause();
  }

  moveObstacleEnd(obstacle: Obstacle, $event: CdkDragEnd) {
    if (this.isInTrash) {
      this.gridCanvasService.deleteObstacle(this.map?.id!, obstacle.id).subscribe((map: Map) => {
        this.map = map
        this.obstacles = this.obstacles.filter(o => o.id !== obstacle.id);
        this.serviceGridCanvas.calcTotalPoints();
      });
    } else {
      let scale = this.canvasValues!.scale;

      if ((obstacle.x + ($event.distance.x) / scale) > 0
        && (obstacle.y + ($event.distance.y) / scale) > 0
        && (obstacle.x + ($event.distance.x) / scale) < TileCount * 100 - obstacle.width!
        && (obstacle.y + ($event.distance.y) / scale) < TileCount * 100 - obstacle.height!
      ) {
        obstacle.x += ($event.distance.x - 1.5) / scale + this.xCorrection;
        obstacle.y += ($event.distance.y - 1.5) / scale + this.yCorrection;
      }

      let centerObstacle = {x: obstacle.x + obstacle.width! / 2, y: obstacle.y + obstacle.height! / 2};

      //check on which tile ist obstacle in grid
      let colX = Math.floor(centerObstacle.x / 100);
      let rowY = Math.floor(centerObstacle.y / 100);

      if (
        (this.grids[this.layer][rowY][colX].value && this.grids[this.layer][rowY][colX].value! > 0 && this.map?.discipline.includes('Line Entry'))
        || (this.obstacles.find(obstacleFind => Math.floor(obstacleFind.x / 100) == colX
          && Math.floor(obstacleFind.y / 100) == rowY
          && obstacleFind.name?.includes('Checkpoint')
          && obstacle.id != obstacleFind.id) != undefined)
        || (obstacle.name?.includes('Checkpoint')
          && (this.obstacles.find(obstacleFind => Math.floor(obstacleFind.x / 100) == colX
            && Math.floor(obstacleFind.y / 100) == rowY
            && obstacle.id != obstacleFind.id) != undefined))
        || this.grids[this.layer][rowY][colX].name?.includes('start')
      ) {
        obstacle.x -= ($event.distance.x) / scale;
        obstacle.y -= ($event.distance.y) / scale;
        this.toastr.info(`${obstacle.name?.toLowerCase()?.includes('checkpoint') ? "Checkpoints" : "Obstacles"} dürfen sich nicht auf Kacheln mit Wertungselementen befinden`)
      }

      let newObstacle = {...obstacle};
      let index = this.obstacles.findIndex((obstacle) => obstacle.id === newObstacle.id);
      this.obstacles[index] = newObstacle;

      this.gridCanvasService.updateObstacle(this.map!.id, newObstacle).subscribe((map: Map) => this.map = map);

    }

    this.currentObstacle = undefined;
    this.serviceGridCanvas.calcTotalPoints();
    this.panzoomCanvas.resume();
  }
}
