import {Component, ElementRef, ViewChild} from '@angular/core';
import {CdkDragDrop, transferArrayItem} from "@angular/cdk/drag-drop";
import {Tile} from "./tile/dto/tile.dto";
import panzoom from 'panzoom';

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
  zoomFactor = 0.05;

  center = 0;
  panzoomCanvas: any = null;

  tiles = [
    {number: 1},
    {number: 2},
    {number: 3},
    {number: 4},
    {number: 5},
    {number: 6},
    {number: 7},
    {number: 8},
    {number: 9},
  ];
  grid: (Tile | undefined)[] = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];

  grids: Array<Array<Array<Tile>>> = [
    [
    ],
  ];

  drop($event: CdkDragDrop<Tile[]>, rowCount: number, colCount: number) {
    //console.log($event.previousContainer.data[$event.previousIndex]);
    this.grids[0][rowCount][colCount] = $event.previousContainer.data[$event.previousIndex]
  }

  constructor() {
    for (let i = 0; i < TileCount; i++) {
      let row: Array<Tile> = [];
      for (let j = 0; j < TileCount; j++) {
        row.push({number: (i*TileCount) + j + 1});
      }
      this.grids[0].push(row);
    }
  }

  ngAfterViewInit() {

    this.center = (TileCount * 100) / 2;
    //console.log("center " + this.center);

    this.panzoomCanvas = panzoom(this.canvasElement!.nativeElement, {
      maxZoom: 2,
      minZoom: 0.5,


    });

    if(this.panzoomCanvas != null) {
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
            this.panzoomCanvas.moveTo(this.canvasWrapperElement?.nativeElement.offsetWidth  - (TileCount * 100 * result.scale) - OutsideDrag, result.y);
          }

          if (result.y < this.canvasWrapperElement?.nativeElement.offsetHeight - (TileCount * 100 * result.scale) - OutsideDrag) {
            this.panzoomCanvas.moveTo(result.x, this.canvasWrapperElement?.nativeElement.offsetHeight - (TileCount * 100 * result.scale) - OutsideDrag);
          }
        } else {
          const reference = 500 * result.scale;

          if(result.x < TileCount * 100 * -result.scale + 500 * result.scale) {
            this.panzoomCanvas.moveTo(TileCount * 100 * -result.scale + 500 * result.scale, result.y);
          }

          if(result.y < TileCount * 100 * -result.scale + 500 * result.scale) {
            this.panzoomCanvas.moveTo(result.x, TileCount * 100 * -result.scale + 500 * result.scale);
          }

          if(result.x > this.canvasWrapperElement?.nativeElement.offsetWidth - reference) {
            this.panzoomCanvas.moveTo(this.canvasWrapperElement?.nativeElement.offsetWidth - reference, result.y);
          }

          if(result.y > this.canvasWrapperElement?.nativeElement.offsetHeight - reference) {
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
    this.panzoomCanvas.resume();
  }
}
