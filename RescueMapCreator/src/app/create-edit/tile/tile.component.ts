import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Tile} from "./dto/tile.dto";
import {trigger, state, style, animate, transition} from '@angular/animations';
import { Transform } from 'panzoom';
import { MatMenuTrigger } from '@angular/material/menu';

const SPACING = 20;

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

  state: string = '0';

  contextMenuPosition = { x: '0px', y: '0px' };

  onRightClick(event: any) {
    event.preventDefault();

    let x = event.layerX - 54 / this.canvasValues?.scale!; //(event.pageX + Math.abs(this.canvasValues?.x!)) * this.canvasValues?.scale! ;
    let y = event.layerY + 83 / this.canvasValues?.scale!; //(event.pageY + Math.abs(this.canvasValues?.y!)) * this.canvasValues?.scale! ;
    this.contextMenuPosition.x = x + 'px';
    this.contextMenuPosition.y = y + 'px';

    console.log(event.pageX + ' ' + event.pageY + ' | ' + this.contextMenuPosition.x + ' ' + this.contextMenuPosition.y );
    console.log( ' ClientX: ' + event.clientX + ' ClientY: '+ event.clientY + ' CanvasX: ' + this.canvasValues?.x + ' CanvasY: ' + this.canvasValues?.y + ' CanvasScale: ' + this.canvasValues?.scale)

    let posX: number = event.layerX % 100;
    let posY: number = event.layerY % 100;

    if (this.tile?.name.includes('evacuationZone')) {
      this.contextMenu!.menu!.focusFirstItem('mouse');
      this.contextMenu!.openMenu();

      if (posX > SPACING && posX < 100 - SPACING && posY < SPACING && this.tile?.border![0]) {
        console.log('Top');
      }
      else if (posY > SPACING && posY < 100 - SPACING && posX > 100 - SPACING && this.tile?.border![1]) {
        console.log('Right');
      }
      else if (posX > SPACING && posX < 100 - SPACING && posY > 100 - SPACING && this.tile?.border![2]) {
        console.log('Bottom');
      }
      else if (posY > SPACING && posY < 100 - SPACING && posX < SPACING && this.tile?.border![3]) {
        console.log('Left');
      }
    } else {
        this.tile!.rotation = (this.tile!.rotation! + 1) % 4;
        this.state = this.tile?.rotation.toString()!;
      }
  }

  onContextMenuAction1() {
    console.log('Action1');
  }

  onContextMenuAction2() {
    console.log('Action2');
  }
}
