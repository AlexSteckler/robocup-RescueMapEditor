import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Tile} from "./dto/tile.dto";
import {trigger, state, style, animate, transition} from '@angular/animations';
import { Transform } from 'panzoom';
import { MatMenuTrigger } from '@angular/material/menu';
import { Evacuation } from './dto/evacuation.dto';

const EXITCOLOR: string = 'green';
const ENTRANCECOLOR: string = '#f0f0f0';

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
  @ViewChild(MatMenuTrigger)

  contextMenu: MatMenuTrigger | undefined;

  ngOnInit(): void {
    this.state = this.tile?.rotation?.toString()!;
  }

  @Input() tile: Tile | undefined;
  @Input() canvasValues : Transform | undefined;

  @Input() evacuationZone : Evacuation | undefined ;

  @Input() position : {x: number, y: number} | undefined;

  @Output() evacuationZoneChange : EventEmitter<Evacuation> = new EventEmitter<Evacuation>();
  @Output() rotationChange : EventEmitter<Tile> = new EventEmitter<Tile>();

  state: string = '0';

  contextMenuPosition = { x: '0px', y: '0px' };

  onRightClick(position:number = -1) {

    if (this.tile?.name.includes('evacuationZone') && position != -1) {
      this.colorSwap(position);
    }
    else if (!this.tile?.isPlaceholder) {
      this.tile!.rotation = (this.tile!.rotation! + 1) % 4;
      this.state = this.tile?.rotation.toString()!;
    }
    this.rotationChange.emit(this.tile);
  }

  colorSwap(index: number) {
    if (this.evacuationZone && this.position) {
      if (this.tile!.border![index] == ENTRANCECOLOR) {
        this.tile!.border![index] = 'black';
        this.evacuationZone!.entrancePlaced = false;
        this.evacuationZone.entrancePosition = {x: -1, y : -1, borderPosition: -1};
      }
      else if (this.tile!.border![index] == EXITCOLOR) {
        this.tile!.border![index] = 'black';
        this.evacuationZone!.exitPlaced = false;
        this.evacuationZone.exitPosition = {x: -1, y : -1, borderPosition: -1};
      }
      else {
        if (this.evacuationZone!.entrancePlaced == false) {
        this.tile!.border![index] = ENTRANCECOLOR;
        this.evacuationZone!.entrancePlaced = true;
        this.evacuationZone.entrancePosition = {x: this.position.x, y : this.position.y, borderPosition: index};
        }
        else if (this.evacuationZone!.exitPlaced == false) {
          this.tile!.border![index] =  EXITCOLOR;
          this.evacuationZone!.exitPlaced = true;
          this.evacuationZone.exitPosition = {x: this.position.x, y : this.position.y, borderPosition: index};
        }
      }
      this.evacuationZoneChange.emit(this.evacuationZone);
    }
  }
}
