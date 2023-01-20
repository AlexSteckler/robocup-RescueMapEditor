import {Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import {CdkDragDrop, CdkDragEnd, CdkDragStart} from "@angular/cdk/drag-drop";
import {Tile} from "./tile/dto/tile.dto";
import panzoom, {Transform} from 'panzoom';
import {TilesService} from './tile/tiles.service';
import {DomSanitizer} from "@angular/platform-browser";
import {Evacuation} from './tile/dto/evacuation.dto';


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
  canvasValues: Transform | undefined;

  public innerHeight: any;

  altActive: Boolean = false;
  deleteActive: Boolean = false;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.innerHeight = window.innerHeight - 240;
  }

  zoomFactor = 0.05;
  panzoomCanvas: any = null;

  tileIsDragged: boolean = false;
  isInTrash: boolean = false;

  tiles: Tile[] = [];
  greenTiles: Tile[] = [];

  evacuation: Evacuation = this.getEvacuationDto(-1, -1);

  grids: Array<Array<Array<Tile>>> = [
    [],
  ];

  currentDraggedTile: Tile | undefined;

  startPosition: { x: number, y: number } = {x: -1, y: -1};

  totalPoints: string = '';

  layer: number = 0;

  constructor(private tilesService: TilesService,
              private sanitizer: DomSanitizer) {
    for (let i = 0; i < TileCount; i++) {
      let row: Array<Tile> = [];
      for (let j = 0; j < TileCount; j++) {
        row.push(this.newTile());
      }
      this.grids[0].push(row);
    }
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

  ngAfterViewInit() {
    this.panzoomCanvas = panzoom(this.canvasElement!.nativeElement, {
      maxZoom: 2,
      minZoom: 0.5,
    });

    if (this.panzoomCanvas != null) {
      this.panzoomCanvas.on('transform', (e: any) => {

        this.canvasValues = this.panzoomCanvas.getTransform();
        if (this.canvasValues != undefined) {
          if (this.canvasValues.scale >= 1) {
            if (this.canvasValues.x > OutsideDrag) {
              this.panzoomCanvas.moveTo(OutsideDrag, this.canvasValues.y);
            }

            if (this.canvasValues.y > OutsideDrag) {
              this.panzoomCanvas.moveTo(this.canvasValues.x, OutsideDrag);
            }

            if (this.canvasValues.x < this.canvasWrapperElement?.nativeElement.offsetWidth - (TileCount * 100 * this.canvasValues.scale) - OutsideDrag) {
              this.panzoomCanvas.moveTo(this.canvasWrapperElement?.nativeElement.offsetWidth - (TileCount * 100 * this.canvasValues.scale) - OutsideDrag, this.canvasValues.y);
            }

            if (this.canvasValues.y < this.canvasWrapperElement?.nativeElement.offsetHeight - (TileCount * 100 * this.canvasValues.scale) - OutsideDrag) {
              this.panzoomCanvas.moveTo(this.canvasValues.x, this.canvasWrapperElement?.nativeElement.offsetHeight - (TileCount * 100 * this.canvasValues.scale) - OutsideDrag);
            }
          } else {
            const reference = 500 * this.canvasValues.scale;

            if (this.canvasValues.x < TileCount * 100 * -this.canvasValues.scale + 500 * this.canvasValues.scale) {
              this.panzoomCanvas.moveTo(TileCount * 100 * -this.canvasValues.scale + 500 * this.canvasValues.scale, this.canvasValues.y);
            }

            if (this.canvasValues.y < TileCount * 100 * -this.canvasValues.scale + 500 * this.canvasValues.scale) {
              this.panzoomCanvas.moveTo(this.canvasValues.x, TileCount * 100 * -this.canvasValues.scale + 500 * this.canvasValues.scale);
            }

            if (this.canvasValues.x > this.canvasWrapperElement?.nativeElement.offsetWidth - reference) {
              this.panzoomCanvas.moveTo(this.canvasWrapperElement?.nativeElement.offsetWidth - reference, this.canvasValues.y);
            }

            if (this.canvasValues.y > this.canvasWrapperElement?.nativeElement.offsetHeight - reference) {
              this.panzoomCanvas.moveTo(this.canvasValues.x, this.canvasWrapperElement?.nativeElement.offsetHeight - reference);
            }
          }

          this.zoomScale = this.canvasValues.scale;
        }
      });
    }

    this.panzoomCanvas.setZoomSpeed(0.05);
  }

  drop($event: CdkDragDrop<Tile[]>, rowCount: number, colCount: number) {
    if ($event.previousContainer.data && !this.grids[this.layer][rowCount][colCount].name.includes('evacuationZone')) {
      this.grids[this.layer][rowCount][colCount] = {...$event.previousContainer.data[$event.previousIndex]}
      this.layerChange(this.layer,rowCount,colCount, {...$event.previousContainer.data[$event.previousIndex]});

      if (this.grids[this.layer][rowCount][colCount].name.includes('start')) {
        if (this.startPosition.x != -1) {
          this.grids[this.layer][this.startPosition.y][this.startPosition.x] = this.newTile();
        }
        this.startPosition = {x: colCount, y: rowCount};

      }
    } else if ($event.previousIndex == 0 && rowCount <= TileCount - 3 && colCount <= TileCount - 4 && !this.grids[this.layer][rowCount][colCount].name.includes('evacuationZone')) {
      this.addEvacuationZoneAcross(this.layer,colCount, rowCount);
      this.evacuation = this.getEvacuationDto(colCount, rowCount);
    } else if ($event.previousIndex == 1) {
      this.addEvacuationZoneUpright(this.layer, colCount, rowCount);
      this.evacuation = this.getEvacuationDto(colCount, rowCount);
    }
    this.calcTotalPoints();
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
    this.currentDraggedTile = tile;
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
        this.evacuation!.position! = {x: colCount + xMove, y: rowCount + yMove};

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
                this.grids[levelCount][rowCount + j - x][colCount + i - y] = this.newTile();
              }
            }
            if (!this.isInTrash) {
              this.evacuation = this.getEvacuationDto(colCount + xMove, rowCount + yMove);
              this.addEvacuationZoneUpright(this.layer,colCount + xMove, rowCount + yMove);
            } else {
              this.evacuation = this.getEvacuationDto(-1, -1);
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
                this.grids[levelCount][rowCount + j - x][colCount + i - y] = this.newTile();
              }
            }
            if (!this.isInTrash) {
              this.evacuation = this.getEvacuationDto(colCount + xMove, rowCount + yMove,);
              this.addEvacuationZoneAcross(this.layer, colCount + xMove, rowCount + yMove,);
            } else {
              this.evacuation = this.getEvacuationDto(-1, -1);
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
          if (this.grids[levelCount][rowCount][colCount].name.includes('start')) {
            this.startPosition = {x: colCount + xMove, y: rowCount + yMove};
          }
        } else {
          if (this.grids[levelCount][rowCount][colCount].name.includes('start')) {
            this.startPosition = {x: -1, y: -1};
          }
        }

        if (!this.altActive) {
          this.grids[levelCount][rowCount][colCount] = this.newTile();
        }
      } else {
        setTimeout(() => {
          if (this.isInTrash) {
            if (this.grids[levelCount][rowCount][colCount].name.includes('start')) {
              this.startPosition = {x: -1, y: -1};
            }
            this.grids[levelCount][rowCount][colCount] = this.newTile();
          }
        }, 50);
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

    if (this.zoomScale != 1) {
      zoomMoveXDifference = (1 - this.zoomScale) * dragRef.getFreeDragPosition().x;
      zoomMoveYDifference = (1 - this.zoomScale) * dragRef.getFreeDragPosition().y;
    }
    return {
      x: point.x + zoomMoveXDifference - this.zoomScale * 50,
      y: point.y + zoomMoveYDifference - this.zoomScale * 50
    };
  };

  private addEvacuationZoneAcross(layer: number, colCount: number, rowCount: number) {
    this.grids[layer][rowCount][colCount] = {name: 'evacuationZoneAcross_00', border: ['black', '', '', 'black']};
    this.grids[layer][rowCount][colCount + 1] = {name: 'evacuationZoneAcross_01', border: ['black', '', '', '']};
    this.grids[layer][rowCount][colCount + 2] = {name: 'evacuationZoneAcross_02', border: ['black', '', '', '']};
    this.grids[layer][rowCount][colCount + 3] = {name: 'evacuationZoneAcross_03', border: ['black', 'black', '', '']};
    this.grids[layer][rowCount + 1][colCount + 3] = {name: 'evacuationZoneAcross_13', border: ['', 'black', '', '']};
    this.grids[layer][rowCount + 2][colCount + 3] = {name: 'evacuationZoneAcross_23', border: ['', 'black', 'black', '']};
    this.grids[layer][rowCount + 2][colCount + 2] = {name: 'evacuationZoneAcross_22', border: ['', '', 'black', '']};
    this.grids[layer][rowCount + 2][colCount + 1] = {name: 'evacuationZoneAcross_21', border: ['', '', 'black', '']};
    this.grids[layer][rowCount + 2][colCount] = {name: 'evacuationZoneAcross_20', border: ['', '', 'black', 'black']};
    this.grids[layer][rowCount + 1][colCount] = {name: 'evacuationZoneAcross_10', border: ['', '', '', 'black']};
    this.grids[layer][rowCount + 1][colCount + 1] = {name: 'evacuationZoneAcross_11', border: ['', '', '', '']};
    this.grids[layer][rowCount + 1][colCount + 2] = {name: 'evacuationZoneAcross_12', border: ['', '', '', '']};
  }

  private addEvacuationZoneUpright(layer: number, colCount: number, rowCount: number) {
    this.grids[layer][rowCount][colCount] = {name: 'evacuationZoneUpright_00', border: ['black', '', '', 'black']};
    this.grids[layer][rowCount][colCount + 1] = {name: 'evacuationZoneUpright_01', border: ['black', '', '', '']};
    this.grids[layer][rowCount][colCount + 2] = {name: 'evacuationZoneUpright_02', border: ['black', 'black', '', '']};
    this.grids[layer][rowCount + 1][colCount + 2] = {name: 'evacuationZoneUpright_12', border: ['', 'black', '', '']};
    this.grids[layer][rowCount + 2][colCount + 2] = {name: 'evacuationZoneUpright_22', border: ['', 'black', '', '']};
    this.grids[layer][rowCount + 3][colCount + 2] = {name: 'evacuationZoneUpright_32', border: ['', 'black', 'black', '']};
    this.grids[layer][rowCount + 3][colCount + 1] = {name: 'evacuationZoneUpright_31', border: ['', '', 'black', '']};
    this.grids[layer][rowCount + 3][colCount] = {name: 'evacuationZoneUpright_30', border: ['', '', 'black', 'black']};
    this.grids[layer][rowCount + 2][colCount] = {name: 'evacuationZoneUpright_20', border: ['', '', '', 'black']};
    this.grids[layer][rowCount + 1][colCount] = {name: 'evacuationZoneUpright_10', border: ['', '', '', 'black']};
    this.grids[layer][rowCount + 1][colCount + 1] = {name: 'evacuationZoneUpright_11', border: ['', '', '', '']};
    this.grids[layer][rowCount + 2][colCount + 1] = {name: 'evacuationZoneUpright_21', border: ['', '', '', '']};
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

  disableContext(event: MouseEvent) {
    event.preventDefault();
  }

  getEvacuationDto(x: number, y: number) {
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
      source: '',
      image: undefined,
      paths: undefined,
      rotation: 0,
    }
  }

  calcTotalPoints() {
    let loopCount = 0;

    if (this.startPosition.x == -1) {
      this.totalPoints = 'Keine Startkachel gegeben';
      return;
    }

    let currentPoints = 5;
    let currentPosition = {...this.startPosition};
    let orientation = (this.grids[0][currentPosition.y][currentPosition.x].rotation!
        + this.grids[0][currentPosition.y][currentPosition.x].paths!.find((path: { from: number, to: number }) => path.from === -1)!.to + 2)
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
        return;
      }
      let currentTile = this.grids[0][currentPosition.y][currentPosition.x]!;
      if (!currentTile!.name) {
        return;
      }

      if (currentTile.name.includes('evacuationZone')) {
        if (this.evacuation.entrancePosition.x != currentPosition.x ||  this.evacuation.entrancePosition.y != currentPosition.y || this.evacuation.entrancePosition.borderPosition != orientation) {
          console.log('no entrance');
          return;
        }
        if (this.evacuation.exitPosition.x == -1) {
          console.log('no exit');
          return;
        }

        currentPosition = {x: this.evacuation.exitPosition.x, y: this.evacuation.exitPosition.y };
        orientation = (this.evacuation.exitPosition.borderPosition + 2) % 4;

        multiplier = 4.3904;

      } else {
        if (!currentTile.paths) {
          return;
        }

        let tileRotation = currentTile.rotation!;
        let tileWay = currentTile.paths!.find((path: { from: number, to: number }) => orientation === (path.from + tileRotation) % 4)
        if (tileWay !== undefined) {
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

  changeLevel(direction : string) {
    if(direction == 'up' && this.layer < 5) {
      this.layer++;
      this.addLevel();

    } else if (direction == 'down' && this.layer > 0) {
      this.layer--;
    }
  }

  addLevel() {
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

  layerChange(layer: number, rowCount: number, colCount: number, tile: Tile) : boolean {

    tile.isPlaceholder = true;

    if (this.grids[this.grids.length + this.layer] == undefined) {
      this.addLevel()
    }

    if ( layer == 0 && this.grids[layer + 1][rowCount][colCount].name == '') {
      this.grids[layer + 1][rowCount][colCount] = tile;
      return true;
    }
    else if ( this.grids[1] != undefined && this.grids[layer + 1 ][rowCount][colCount].name == '' && this.grids[layer - 1][rowCount][colCount].name == '') {
      this.grids[layer - 1][rowCount][colCount] = tile;
      this.grids[layer + 1][rowCount][colCount] = tile;
      return true;
    }

    return false;
  }
}
