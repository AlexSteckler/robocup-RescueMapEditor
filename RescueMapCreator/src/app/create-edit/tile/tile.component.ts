import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Tile} from "./dto/tile.dto";
import {trigger, state, style, animate, transition} from '@angular/animations';
import { Transform } from 'panzoom';

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

  ngOnInit(): void {
    this.state = this.tile?.rotation?.toString()!;
  }

  @Input() tile: Tile | undefined;
  @Input() canvasValues : Transform | undefined;

  state: string = '0';

  onRightClick(event: MouseEvent) {
    //console.log(event);
    var x = (event.pageX - this.evacuationTile!.nativeElement.offsetLeft) % 100;
    var y = (event.pageY - this.evacuationTile!.nativeElement.offsetTop) % 100;



    //console.log(this.evacuationTile!.nativeElement);
    //console.log(event.clientX % 100 + ' ' + event.clientY % 100)
    let posX: number = (event.clientX + Math.abs(this.canvasValues!.x)) % 100;
    let posY: number = (event.clientY + Math.abs(this.canvasValues!.y)) % 100;

    console.log(posX + ' ' + posY + ' ClientX: ' + event.clientX + ' ClientY: '+ event.clientY + ' CanvasX: ' + this.canvasValues?.x + ' CanvasY: ' + this.canvasValues?.y + ' CanvasScale: ' + this.canvasValues?.scale)

    if(this.tile?.name.includes('evacuationZone')) {
      if (posX > SPACING && posX < 100 - SPACING && posY < SPACING && this.tile?.border![0]) {
        //console.log('Top');
      }
      else if (posY > SPACING && posY < 100 - SPACING && posX > 100 - SPACING && this.tile?.border![1]) {
        //console.log('Right');
      }
      else if (posX > SPACING && posX < 100 - SPACING && posY > 100 - SPACING && this.tile?.border![2]) {
        //console.log('Bottom');
      }
      else if (posY > SPACING && posY < 100 - SPACING && posX < SPACING && this.tile?.border![3]) {
        //console.log('Left');
      }

    //console.log(posX + ' ' + posY)
    }

    this.tile!.rotation = (this.tile!.rotation! + 1) % 4;
    this.state = this.tile?.rotation.toString()!;
    return false;
  }
}
