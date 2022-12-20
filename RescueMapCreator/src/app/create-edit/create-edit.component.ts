import {Component, ElementRef, ViewChild} from '@angular/core';
import {CdkDragDrop, transferArrayItem} from "@angular/cdk/drag-drop";
import {Tile} from "./tile/dto/tile.dto";
import panzoom from 'panzoom';

@Component({
  selector: 'app-create-edit',
  templateUrl: './create-edit.component.html',
  styleUrls: ['./create-edit.component.scss']
})
export class CreateEditComponent {
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
    const count = 10;
    for (let i = 1; i <= count; i++) {
      let row: Array<Tile> = [];
      for (let j = 1; j <= count; j++) {
        row.push({number: i * j});
      }
      this.grids[0].push(row);
    }
  }
  zoomScale = 1;
  zoomFactor = 0.05;
  panzoomCanvas: any = null;
  @ViewChild('canvas') canvasElement: ElementRef | undefined;

  ngAfterViewInit() {
    this.panzoomCanvas = panzoom(this.canvasElement?.nativeElement, {
      maxZoom: 1,
      minZoom: 0.1,
    });

    if(this.panzoomCanvas != null) {
      this.panzoomCanvas.on('transform', (e: any) => {
        let result = this.panzoomCanvas.getTransform();
        this.zoomScale = result.scale;
      });
    }

  }

  pausePanzoom() {
    this.panzoomCanvas.pause();
  }

  resumePanzoom() {
    this.panzoomCanvas.resume();
  }
}
