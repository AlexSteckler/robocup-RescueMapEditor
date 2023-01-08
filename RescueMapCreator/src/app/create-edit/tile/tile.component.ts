import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Tile} from "./dto/tile.dto";
import { TilesService } from './tiles.service';
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {trigger, state, style, animate, transition} from '@angular/animations';

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

export class TileComponent {

  @Input() zoomScale = 1;
  @Input() pos = { x: 0, y: 0 };

  @Output() dragStart = new EventEmitter<any>();
  @Output() dragEnd = new EventEmitter<any>();

  


  @Input() tile: Tile | undefined;

  state: string = '0';

  constructor() {
  }

  onRightClick() {
    this.tile!.rotation = (this.tile!.rotation + 1) % 4;

    this.rotate();
    return false;
  }

  rotate() {
    if (this.tile?.rotation == 0) {
      this.state = '0';
    } else if (this.tile?.rotation == 1) {
      this.state = '1';
    } else if (this.tile?.rotation == 2) {
      this.state = '2';
    } else if (this.tile?.rotation == 3) {
      this.state = '3';
    }
  }
}
