import {Tile} from "../tile/dto/tile.dto";
import {GridCanvasComponent, OutsideDrag, TileCount} from "./grid-canvas.component";
import {ToastrService} from "ngx-toastr";

export class ServiceGridCanvas {
  constructor(
    private gridCanvasComponent: GridCanvasComponent,
    private toastr: ToastrService,
  ) {
  }

  calcTotalPoints() {
    let loopCount = 0;
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

      if (currentPosition.x < 0 || currentPosition.y < 0) {
        this.gridCanvasComponent.totalPoints = 'Pacours führt aus dem Spielfeld';
        this.toastr.warning('Pacours führt aus dem Spielfeld');
        return;
      }
      let currentTile =
        this.gridCanvasComponent.grids[currentPosition.layer][currentPosition.y][
          currentPosition.x
          ]!;
      if (!currentTile!.name || currentTile.isPlaceholder) {
        return;
      }

      if (currentTile.name.includes('evacuationZone')) {
        if (
          this.gridCanvasComponent.evacuation.entry == undefined ||
          this.gridCanvasComponent.evacuation.entry.x != currentPosition.x ||
          this.gridCanvasComponent.evacuation.entry.y != currentPosition.y ||
          this.gridCanvasComponent.evacuation.entry.position != orientation
        ) {
          return;
        }
        if (this.gridCanvasComponent.evacuation.exit == undefined || this.gridCanvasComponent.evacuation.exit.x == -1) {
          return;
        }

        currentPosition = {
          layer: this.gridCanvasComponent.layer,
          x: this.gridCanvasComponent.evacuation.exit.x,
          y: this.gridCanvasComponent.evacuation.exit.y,
        };
        orientation = (this.gridCanvasComponent.evacuation.exit.position + 2) % 4;

        multiplier = 4.3904;
      } else {
        if (!currentTile.paths) {
          return;
        }

        let tileRotation = currentTile.rotation!;
        let tileWay = currentTile.paths!.find(
          (path: { from: number; to: number; layer: number }) =>
            orientation === (path.from + tileRotation) % 4
        );
        if (tileWay !== undefined) {
          currentPosition.layer += tileWay.layer;
          if (currentPosition.layer < 0) {
            this.toastr.warning('Rampe führt ins nichts!');
            return;
          }

          orientation = (tileRotation + tileWay.to + 2) % 4;
          currentPoints += currentTile.value ? currentTile.value + 5 : 5;
          this.gridCanvasComponent.totalPoints = Math.round(currentPoints * multiplier).toString();
        } else {
          return;
        }
      }
    }

    if (loopCount >= 1000) {
      this.gridCanvasComponent.totalPoints =
        'Ihre Bahn erzeugt eine Schleife. Parkour nicht zugelassen!';
    }
  }

  stopDragForFarAwayMoving() {
    this.gridCanvasComponent.panzoomCanvas.on('transform', (e: any) => {
      //this.gridCanvasComponent.canvasDummyElement!.nativeElement.style.transform = e.transform;
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
    let tempgrid: Array<Array<Tile>> = [];

    for (let i = 0; i < TileCount; i++) {
      let row: Array<Tile> = [];
      for (let j = 0; j < TileCount; j++) {
        row.push(this.newTile());
      }
      tempgrid.push(row);
    }
    this.gridCanvasComponent.grids.push(tempgrid);
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
    };
  }
}
