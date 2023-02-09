import {Tile} from "../tile/dto/tile.dto";
import {GridCanvasComponent, OutsideDrag, TileCount} from "./grid-canvas.component";
import {ToastrService} from "ngx-toastr";
import {Obstacle} from "../obstacle/dto/obstacle.dto";
import { GridCanvasService } from "./grid-canvas.service";

export class ServiceGridCanvas {
  constructor(
    private gridCanvasComponent: GridCanvasComponent,
    private gridCanvasSercive: GridCanvasService,
    private toastr: ToastrService,
  ) {
  }

  calcTotalPoints() {
    let loopCount = 0;
    let tileCountToCheckpoints: number[] = [];
    let tilePositionList: { layer: number, x: number, y: number }[] = [];
    let checkpointPosition: { layer: number, x: number, y: number }[] = [];
    if (this.gridCanvasComponent.startPosition.x == -1) {
      this.gridCanvasComponent.totalPoints = 'Keine Startkachel gegeben';
      return;
    }

    let currentPoints = 5;
    let currentPosition = {...this.gridCanvasComponent.startPosition};

    let orientation =
      (this.gridCanvasComponent.grids[currentPosition.layer][currentPosition.y][currentPosition.x]
          .rotation! +
        this.gridCanvasComponent.grids[currentPosition.layer][currentPosition.y][
          currentPosition.x
          ].paths!.find((path: { from: number; to: number }) => path.from === -1)!
          .to +
        2) %
      4;

    this.gridCanvasComponent.totalPoints = currentPoints.toString();

    let multiplier: number = 1;

    while (orientation >= 0 && loopCount++ <= 1000) {
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

      if (currentPosition.x < 0 || currentPosition.y < 0) {
        this.gridCanvasComponent.totalPoints = 'Weg führt aus dem Spielfeld';
        this.toastr.warning('Weg führt aus dem Spielfeld');
        orientation = -2;
        continue;
      }
      let currentTile =
        this.gridCanvasComponent.grids[currentPosition.layer][currentPosition.y][currentPosition.x]!;
      if (!currentTile!.name || currentTile.isPlaceholder) {
        orientation = -3;
        continue;
      }

      if (currentTile.name.includes('evacuationZone')) {
        if (
          this.gridCanvasComponent.evacuation.entry == undefined ||
          this.gridCanvasComponent.evacuation.entry.x != currentPosition.x ||
          this.gridCanvasComponent.evacuation.entry.y != currentPosition.y ||
          this.gridCanvasComponent.evacuation.entry.position != orientation
        ) {
          orientation = -4;
          continue;
        }
        if ((this.gridCanvasComponent.evacuation.exit == undefined || this.gridCanvasComponent.evacuation.exit.x == -1) && this.gridCanvasComponent.map?.discipline.toLowerCase() !== 'line entry') {
          orientation = -5;
          continue;
        }

        currentPosition = {
          layer: this.gridCanvasComponent.evacuation.exit.layer,
          x: this.gridCanvasComponent.evacuation.exit.x,
          y: this.gridCanvasComponent.evacuation.exit.y,
        };
        orientation = (this.gridCanvasComponent.evacuation.exit.position + 2) % 4;

        multiplier = this.gridCanvasComponent.map?.discipline === 'line entry'? 2.744 : 4.3904;

        if (this.gridCanvasComponent.map?.discipline.toLowerCase() == 'line entry') {
          orientation = -10;
          continue;
        }

      } else {
        if (!currentTile.paths) {
          orientation = -6;
          continue;
        }

        // Punkteberechnung Line Entry
        let tileRotation = currentTile.rotation!;
        let tileWay = currentTile.paths!.filter(
          (path: { from: number; to: number; layer: number }) =>
            orientation === (path.from + tileRotation) % 4
        );
        if (tileWay !== undefined && tileWay.length > 0) {
          if (tileWay.length > 1) {
            if (this.gridCanvasComponent.map?.discipline === 'Line Entry') {
              let i = 1;
              let from = tileWay[0].from;
              while ( i <= 3 ) {
                from = (from + (this.gridCanvasComponent.map.isLeftDirection? 1 : -1)) % 4;
                let exit = tileWay.filter(way => way.to === from);
                if (exit) {
                  tileWay = exit;
                  break;
                }
                i++;
              }
            } else {
              this.toastr.warning('Mehr als eine Ausfahrt gefunden!');
              orientation = -8;
              continue;
            }
          }

          currentPosition.layer += tileWay[0].layer;
          if (currentPosition.layer < 0) {
            this.toastr.warning('Rampe führt ins nichts!');
            orientation = -7;
            continue;
          }

          if (tileWay[0].to !== -1) {
            orientation = (tileRotation + tileWay[0].to + 2) % 4;
          } else {
            orientation = -1;
          }

          tilePositionList.push({...currentPosition});
          currentPoints += currentTile.value ? currentTile.value : 0;
        } else {
          orientation = -9;
          continue;
        }
      }
    }
    if (loopCount >= 1000) {
      this.gridCanvasComponent.totalPoints =
        'Ihre Bahn erzeugt eine Schleife. Parkour nicht zugelassen!';
      return;
    }

    this.gridCanvasComponent.obstacles.forEach((obstacle: Obstacle) => {
      if (tilePositionList.find((position: { layer: number, x: number, y: number }) =>
        position.layer == obstacle.layer
        && position.x == Math.floor((obstacle.x + (obstacle.width / 2)) / 100)
        && position.y == Math.floor((obstacle.y + (obstacle.height / 2)) / 100))) {
          if (!obstacle.name?.includes('Checkpoint')) {
            currentPoints += obstacle.value !== undefined ? obstacle.value : 0;
            obstacle.rated = true;
          } else {
            checkpointPosition.push({ layer: obstacle.layer, x: Math.floor((obstacle.x + (obstacle.width / 2)) / 100), y: Math.floor((obstacle.y + (obstacle.height / 2)) / 100) });
            obstacle.rated = true;
          }
      } else {
        obstacle.rated = false;
      }
    });

    if (checkpointPosition.length > 0) {
      let tileCount : number = 0;
      for (let i = 0; i < tilePositionList.length; i++) {
        tileCount++;
        let checkpointPos = checkpointPosition.find((position: { layer: number, x: number, y: number }) =>
          position.layer == tilePositionList[i].layer
          && position.x == tilePositionList[i].x
          && position.y == tilePositionList[i].y);
        {
          if (checkpointPos !== undefined)  {
            currentPoints += 5 * tileCount;
            tileCountToCheckpoints.push(tileCount);
            tileCount = 0;
          }
        }
      }
    }

    this.gridCanvasComponent.totalPoints = Math.round((currentPoints + (orientation === -1 ? 60 : 0)) * multiplier).toString();
    let mapInfo = {
      scoreCount: +this.gridCanvasComponent.totalPoints,
      sections: tileCountToCheckpoints,
      isLeftDirection: this.gridCanvasComponent.map?.isLeftDirection
    };

    this.gridCanvasSercive.updateMap(this.gridCanvasComponent.map?.id!, mapInfo).subscribe((response: any) => {});
  }

  stopDragForFarAwayMoving() {
    this.gridCanvasComponent.panzoomCanvas.on('transform', (e: any) => {
      this.gridCanvasComponent.canvasValues = this.gridCanvasComponent.panzoomCanvas.getTransform();
      this.gridCanvasComponent.canvasValuesChange.emit(this.gridCanvasComponent.canvasValues);

      const nativeElement = this.gridCanvasComponent.canvasWrapperElement!.nativeElement;
      const scale = this.gridCanvasComponent.canvasValues!.scale;
      const x = this.gridCanvasComponent.canvasValues!.x;
      const y = this.gridCanvasComponent.canvasValues!.y;
      const size = TileCount * 100;

      if (this.gridCanvasComponent.canvasValues != undefined) {
        if (this.gridCanvasComponent.canvasValues.scale >= 1) {
          if (x > OutsideDrag) {
            this.gridCanvasComponent.panzoomCanvas.moveTo(OutsideDrag, y);
          }
          if (y > OutsideDrag) {
            this.gridCanvasComponent.panzoomCanvas.moveTo(x, OutsideDrag);
          }

          if (x < nativeElement.offsetWidth - size * scale - OutsideDrag) {
            this.gridCanvasComponent.panzoomCanvas.moveTo(
              nativeElement.offsetWidth - size * scale - OutsideDrag, y);
          }

          if (y < nativeElement.offsetHeight - size * scale - OutsideDrag) {
            this.gridCanvasComponent.panzoomCanvas.moveTo(
              x,
              nativeElement.offsetHeight - size * scale - OutsideDrag
            );
          }
        } else {
          const reference = 500 * scale;

          if (x < size * -scale + 500 * scale) {
            this.gridCanvasComponent.panzoomCanvas.moveTo(size * -scale + 500 * scale, y);
          }

          if (y < size * -scale + 500 * scale) {
            this.gridCanvasComponent.panzoomCanvas.moveTo(x, size * -scale + 500 * scale);
          }

          if (x > nativeElement.offsetWidth - reference) {
            this.gridCanvasComponent.panzoomCanvas.moveTo(nativeElement.offsetWidth - reference, y);
          }

          if (y > nativeElement.offsetHeight - reference) {
            this.gridCanvasComponent.panzoomCanvas.moveTo(x, nativeElement.offsetHeight - reference);
          }
        }
      }
    });
  }

  addLayer() {
    let tempGrid: Array<Array<Tile>> = [];

    for (let i = 0; i < TileCount; i++) {
      let row: Array<Tile> = [];
      for (let j = 0; j < TileCount; j++) {
        row.push(this.newTile());
      }
      tempGrid.push(row);
    }
    this.gridCanvasComponent.grids.push(tempGrid);
  }

  newTile() {
    return {
      id: '0',
      name: '',
      imageId: '',
      image: undefined,
      value: 0,
      paths: undefined,
      rotation: 0,
      isPlaceholder: false,
    };
  }
}
