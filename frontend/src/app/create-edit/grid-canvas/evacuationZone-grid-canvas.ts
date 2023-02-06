import {Map} from "../dto/map.dto";
import {GridCanvasService} from "./grid-canvas.service";
import {ToastrService} from "ngx-toastr";
import {GridCanvasComponent} from "./grid-canvas.component";
import {ServiceGridCanvas} from "./service-grid-canvas";
import {ENTRANCECOLOR, EXITCOLOR} from "../tile/tile.component";

export class EvacuationZoneGridCanvas {
  private serverGridsCanvas: ServiceGridCanvas;

  constructor(
    private gridCanvasComponent: GridCanvasComponent,
    private gridCanvasService: GridCanvasService,
    private toastr: ToastrService,
  ) {
    this.serverGridsCanvas = new ServiceGridCanvas(gridCanvasComponent, toastr);
  }

  addEvacuationZoneAcross(
    layer: number,
    rowCount: number,
    colCount: number,
    isPlaceholder: boolean = false,
    load: boolean = false
  ) {
    if (!this.checkIfEvacuationZoneIsPossible(layer, rowCount, colCount, true)) {
      return false;
    }
    if (!isPlaceholder && !load) {
      this.gridCanvasComponent.evacuation = this.getEvacuationDto(layer, rowCount, colCount, true);
      this.gridCanvasService
        .updateEvacuationZone(this.gridCanvasComponent.map!.id, layer, rowCount, colCount, true)
        .subscribe((map: Map) => {
          this.gridCanvasComponent.map = map;
        });
    }

    this.gridCanvasComponent.grids[layer][rowCount][colCount] = {
      name: 'evacuationZoneAcross_00', border: ['black', '', '', 'black'], isPlaceholder,
    };
    this.gridCanvasComponent.grids[layer][rowCount][colCount + 1] = {
      name: 'evacuationZoneAcross_01', border: ['black', '', '', ''], isPlaceholder,
    };
    this.gridCanvasComponent.grids[layer][rowCount][colCount + 2] = {
      name: 'evacuationZoneAcross_02', border: ['black', '', '', ''], isPlaceholder,
    };
    this.gridCanvasComponent.grids[layer][rowCount][colCount + 3] = {
      name: 'evacuationZoneAcross_03', border: ['black', 'black', '', ''], isPlaceholder,
    };
    this.gridCanvasComponent.grids[layer][rowCount + 1][colCount + 3] = {
      name: 'evacuationZoneAcross_13', border: ['', 'black', '', ''], isPlaceholder,
    };
    this.gridCanvasComponent.grids[layer][rowCount + 2][colCount + 3] = {
      name: 'evacuationZoneAcross_23', border: ['', 'black', 'black', ''], isPlaceholder,
    };
    this.gridCanvasComponent.grids[layer][rowCount + 2][colCount + 2] = {
      name: 'evacuationZoneAcross_22', border: ['', '', 'black', ''], isPlaceholder,
    };
    this.gridCanvasComponent.grids[layer][rowCount + 2][colCount + 1] = {
      name: 'evacuationZoneAcross_21', border: ['', '', 'black', ''], isPlaceholder,
    };
    this.gridCanvasComponent.grids[layer][rowCount + 2][colCount] = {
      name: 'evacuationZoneAcross_20', border: ['', '', 'black', 'black'], isPlaceholder,
    };
    this.gridCanvasComponent.grids[layer][rowCount + 1][colCount] = {
      name: 'evacuationZoneAcross_10', border: ['', '', '', 'black'], isPlaceholder,
    };
    this.gridCanvasComponent.grids[layer][rowCount + 1][colCount + 1] = {
      name: 'evacuationZoneAcross_11', border: ['', '', '', ''], isPlaceholder,
    };
    this.gridCanvasComponent.grids[layer][rowCount + 1][colCount + 2] = {
      name: 'evacuationZoneAcross_12', border: ['', '', '', ''], isPlaceholder,
    };

    if (isPlaceholder == false) {
      if (this.gridCanvasComponent.grids[this.gridCanvasComponent.grids.length + layer] == undefined) {
        this.serverGridsCanvas.addLayer();
      }
      if(layer + 1 == undefined) {
        this.toastr.error('Layer up is undefined');
        this.serverGridsCanvas.addLayer();
      }
      this.addEvacuationZoneAcross(layer + 1, rowCount, colCount, true);
    }

    return true;
  }

  addEvacuationZoneUpright(
    layer: number,
    rowCount: number,
    colCount: number,
    isPlaceholder: boolean = false,
    load: boolean = false
  ) {
    if (!this.checkIfEvacuationZoneIsPossible(layer, rowCount, colCount, false)) {
      return false;
    }
    if (!isPlaceholder && !load) {
      this.gridCanvasComponent.evacuation = this.getEvacuationDto(layer, rowCount, colCount, false);
      this.gridCanvasService
        .updateEvacuationZone(this.gridCanvasComponent.map!.id, layer, rowCount, colCount, false)
        .subscribe((map: Map) => {
          this.gridCanvasComponent.map = map;
        });
    }

    this.gridCanvasComponent.grids[layer][rowCount][colCount] = {
      name: 'evacuationZoneUpright_00', border: ['black', '', '', 'black'], isPlaceholder,
    };
    this.gridCanvasComponent.grids[layer][rowCount][colCount + 1] = {
      name: 'evacuationZoneUpright_01', border: ['black', '', '', ''], isPlaceholder,
    };
    this.gridCanvasComponent.grids[layer][rowCount][colCount + 2] = {
      name: 'evacuationZoneUpright_02', border: ['black', 'black', '', ''], isPlaceholder,
    };
    this.gridCanvasComponent.grids[layer][rowCount + 1][colCount + 2] = {
      name: 'evacuationZoneUpright_12', border: ['', 'black', '', ''], isPlaceholder,
    };
    this.gridCanvasComponent.grids[layer][rowCount + 2][colCount + 2] = {
      name: 'evacuationZoneUpright_22', border: ['', 'black', '', ''], isPlaceholder,
    };
    this.gridCanvasComponent.grids[layer][rowCount + 3][colCount + 2] = {
      name: 'evacuationZoneUpright_32', border: ['', 'black', 'black', ''], isPlaceholder,
    };
    this.gridCanvasComponent.grids[layer][rowCount + 3][colCount + 1] = {
      name: 'evacuationZoneUpright_31', border: ['', '', 'black', ''], isPlaceholder,
    };
    this.gridCanvasComponent.grids[layer][rowCount + 3][colCount] = {
      name: 'evacuationZoneUpright_30', border: ['', '', 'black', 'black'], isPlaceholder,
    };
    this.gridCanvasComponent.grids[layer][rowCount + 2][colCount] = {
      name: 'evacuationZoneUpright_20', border: ['', '', '', 'black'], isPlaceholder,
    };
    this.gridCanvasComponent.grids[layer][rowCount + 1][colCount] = {
      name: 'evacuationZoneUpright_10', border: ['', '', '', 'black'], isPlaceholder,
    };
    this.gridCanvasComponent.grids[layer][rowCount + 1][colCount + 1] = {
      name: 'evacuationZoneUpright_11', border: ['', '', '', ''], isPlaceholder,
    };
    this.gridCanvasComponent.grids[layer][rowCount + 2][colCount + 1] = {
      name: 'evacuationZoneUpright_21', border: ['', '', '', ''], isPlaceholder,
    };

    if (isPlaceholder == false) {
      if (this.gridCanvasComponent.grids[this.gridCanvasComponent.grids.length + layer] == undefined) {
        this.serverGridsCanvas.addLayer();
      }
      this.addEvacuationZoneUpright(layer + 1, rowCount, colCount, true);
    }

    return true;
  }

  checkIfEvacuationZoneIsPossible(layer: number, rowCount: number, colCount: number, isAcross: boolean) {
    if (this.gridCanvasComponent.grids[layer + 1] != undefined) {
      for (let i = 0; i < (isAcross ? 4 : 3); i++) {
        for (let j = 0; j < (isAcross ? 3 : 4); j++) {
          if (
            this.gridCanvasComponent.grids[layer][rowCount + j][colCount + i].name != '' ||
            this.gridCanvasComponent.grids[layer + 1][rowCount + j][colCount + i].name != ''
          ) {
            this.toastr.warning('Kacheln sind belegt');
            return false;
          }
        }
      }
    }
    return true;
  }

  deleteEvacuationZone(layerCount: number, rowCount: number, colCount: number) {
    this.gridCanvasComponent.evacuation = this.getEvacuationDto(-1, -1, -1, true);
    const upright: boolean =
      this.gridCanvasComponent.grids[layerCount][rowCount][colCount].name.includes('Upright');

    if (this.gridCanvasComponent.isInTrash) {
      this.gridCanvasService
        .deleteEvacuationZone(this.gridCanvasComponent.map!.id)
        .subscribe((map) => {
          this.gridCanvasComponent.map = map;
        });
    }

    for (let i = 0; i < (upright ? 3 : 4); i++) {
      for (let j = 0; j < (upright ? 4 : 3); j++) {
        this.gridCanvasComponent.grids[layerCount][rowCount + j][colCount + i] = this.serverGridsCanvas.newTile();
        this.gridCanvasComponent.grids[layerCount + 1][rowCount + j][colCount + i] = this.serverGridsCanvas.newTile();
      }
    }
  }

  getEvacuationDto(layer: number, row: number, column: number, across: boolean) {
    this.gridCanvasComponent.evacuationExists.emit(row == -1 ? false : true);
    return {
      layer, column, row, across, exit: {x: -1, y: -1, position: -1, layer: -1}, entry: {x: -1, y: -1, position: -1, layer: -1},
    };
  }

  loadEvacuation(evacuationZone: {
    layer: number, row: number, column: number,
    entry: { x: number, y: number, position: number, layer: number },
    exit: { x: number, y: number, position: number, layer: number }, across: boolean
  }) {
    if (evacuationZone != undefined) {
      this.gridCanvasComponent.evacuationExists.emit(true);
      if (evacuationZone.across) {
        this.addEvacuationZoneAcross(
          evacuationZone.layer,
          evacuationZone.row,
          evacuationZone.column,
          false,
          true
        );
      } else {
        this.addEvacuationZoneUpright(
          evacuationZone.layer,
          evacuationZone.row,
          evacuationZone.column,
          false,
          true
        );
      }

      if (
        evacuationZone.entry != undefined &&
        evacuationZone.entry.position != -1
      ) {
        this.gridCanvasComponent.grids[evacuationZone.layer][evacuationZone.entry.y][
          evacuationZone.entry.x
          ].border![evacuationZone.entry.position] = ENTRANCECOLOR;
      }

      if (
        evacuationZone.exit != undefined &&
        evacuationZone.exit.position != -1
      ) {
        this.gridCanvasComponent.grids[evacuationZone.layer][evacuationZone.exit.y][
          evacuationZone.exit.x
          ].border![evacuationZone.exit.position] = EXITCOLOR;
      }
      this.gridCanvasComponent.evacuation = evacuationZone;
    } else {
      this.gridCanvasComponent.evacuationExists.emit(false);
    }
  }

  evacuationZoneChange($event: any) {
    let evacuation = $event;
    this.gridCanvasComponent.evacuation = evacuation;
    this.gridCanvasService
      .updateEvacuationZone(
        this.gridCanvasComponent.map!.id,
        this.gridCanvasComponent.layer,
        evacuation.row,
        evacuation.column,
        evacuation.across,
        evacuation.entry,
        evacuation.exit
      ).subscribe((map: Map) => this.gridCanvasComponent.map = map);
  }
}
