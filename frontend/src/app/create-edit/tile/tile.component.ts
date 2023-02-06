import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Tile} from "./dto/tile.dto";
import {trigger, state, style} from '@angular/animations';
import { Transform } from 'panzoom';
import { Evacuation } from '../dto/evacuation.dto';

export const EXITCOLOR: string = 'green';
export const ENTRANCECOLOR: string = '#f0f0f0';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss'],
  animations: [
    trigger('rotatedState', [
      state('0', style({transform: 'rotate(0)'})),
      state('1', style({transform: 'rotate(90deg)'})),
      state('2', style({transform: 'rotate(180deg)'})),
      state('3', style({transform: 'rotate(270deg)'})),
    ])
  ]
})

export class TileComponent implements OnInit{
  @ViewChild('evacuationTile') evacuationTile: ElementRef | undefined;

  @Input() tile: Tile | undefined;
  @Input() canvasValues : Transform | undefined;
  @Input() evacuationZone : Evacuation | undefined ;
  @Input() position : {x: number, y: number, layer: number} | undefined;
  @Input() isCurrentlyDraggedTile: Boolean = false;

  @Output() evacuationZoneChange : EventEmitter<Evacuation> = new EventEmitter<Evacuation>();
  @Output() tileChange : EventEmitter<Tile> = new EventEmitter<Tile>();

  state: string = '0';

  constructor() {}

  ngOnInit(): void {
    this.state = this.tile?.rotation?.toString()!;

  }

  onRightClick(position:number = -1) {
    if (this.tile?.name.includes('evacuationZone') && position != -1) {
      this.colorSwap(position);
    }
    else if (!this.tile?.isPlaceholder) {
      this.tile!.rotation = (this.tile!.rotation! + 1) % 4;
      this.state = this.tile?.rotation.toString()!;
    }
    this.tileChange.emit(this.tile);
  }

  colorSwap(index: number) {
    if (this.evacuationZone && this.position) {
      if (this.tile!.border![index] == ENTRANCECOLOR) {
        this.tile!.border![index] = 'black';
        this.evacuationZone.entry = {x: -1, y : -1, position: -1, layer: -1};
      }
      else if (this.tile!.border![index] == EXITCOLOR) {
        this.tile!.border![index] = 'black';
        this.evacuationZone.exit = {x: -1, y : -1, position: -1, layer: -1};
      }
      else {
        if (this.evacuationZone!.entry == undefined || this.evacuationZone!.entry.x == -1) {
        this.tile!.border![index] = ENTRANCECOLOR;
        this.evacuationZone.entry = {x: this.position.x, y : this.position.y, position: index, layer: this.position.layer};
        }
        else if (this.evacuationZone!.exit == undefined || this.evacuationZone!.exit.x == -1) {
          this.tile!.border![index] =  EXITCOLOR;
          this.evacuationZone.exit = {x: this.position.x, y : this.position.y, position: index, layer: this.position.layer};
        }
      }
      this.evacuationZoneChange.emit(this.evacuationZone);
    }
  }
}
