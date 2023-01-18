import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Tile} from "./dto/tile.dto";
import {trigger, state, style, animate, transition} from '@angular/animations';
import { Transform } from 'panzoom';
import { MatMenuTrigger } from '@angular/material/menu';
import { Evacuation } from './dto/evacuation.dto';

const SPACING = 30;
const ENTRANCECOLOR: string = 'green';
const EXITCOLOR: string = '#f0f0f0';

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

  onRightClick(event: any) {
    event.preventDefault();

    //console.log(event.pageX + ' ' + event.pageY + ' | ' + this.contextMenuPosition.x + ' ' + this.contextMenuPosition.y );
    //console.log( ' ClientX: ' + event.clientX + ' ClientY: '+ event.clientY + ' CanvasX: ' + this.canvasValues?.x + ' CanvasY: ' + this.canvasValues?.y + ' CanvasScale: ' + this.canvasValues?.scale)

    let posX: number = event.layerX % 100;
    let posY: number = event.layerY % 100;


    if (this.tile?.name.includes('evacuationZone') && this.evacuationZone && this.position) {

      if (posX > SPACING && posX < 100 - SPACING && posY < SPACING && this.tile?.border![0]) {
        this.colorSwap(0);
        console.log('Top');
      }
      else if (posY > SPACING && posY < 100 - SPACING && posX > 100 - SPACING && this.tile?.border![1]) {
        this.colorSwap(1);
        console.log('Right');
      }
      else if (posX > SPACING && posX < 100 - SPACING && posY > 100 - SPACING && this.tile?.border![2]) {
        this.colorSwap(2);
        console.log('Bottom');
      }
      else if (posY > SPACING && posY < 100 - SPACING && posX < SPACING && this.tile?.border![3]) {
        this.colorSwap(3);

        console.log('Left');
      }
    }

    else {
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
        if (this.evacuationZone!.exitPlaced == false) {
          this.tile!.border![index] = EXITCOLOR;
          this.evacuationZone!.exitPlaced = true;
          this.evacuationZone.exitPosition = {x: this.position.x, y : this.position.y, borderPosition: index};
        }
        else if (this.evacuationZone!.entrancePlaced == false) {
          this.tile!.border![index] = ENTRANCECOLOR;
          this.evacuationZone!.entrancePlaced = true;
          this.evacuationZone.entrancePosition = {x: this.position.x, y : this.position.y, borderPosition: index};
        }
      }
      this.evacuationZoneChange.emit(this.evacuationZone);
    }
  }
}
