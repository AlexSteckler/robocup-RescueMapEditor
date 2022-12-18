import {Component} from '@angular/core';
import {CdkDragDrop, transferArrayItem} from "@angular/cdk/drag-drop";
import {Tile} from "./tile/dto/tile.dto";

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

  drop($event: CdkDragDrop<Tile[]>, tileNumber: number) {
    //console.log($event.previousContainer.data[$event.previousIndex]);
    this.grid[tileNumber] = $event.previousContainer.data[$event.previousIndex]
  }
}
