import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Tile} from "./dto/tile.dto";
import { TilesService } from './tiles.service';
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {trigger, state, style, animate, transition} from '@angular/animations';
import { CdkDrag } from '@angular/cdk/drag-drop';

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
  ngOnInit(): void {
    this.state = this.tile?.rotation.toString()!;
  }

  @Input() tile: Tile | undefined;

  state: string = '0';

  onRightClick() {
    this.tile!.rotation = (this.tile!.rotation + 1) % 4;

    this.state = this.tile?.rotation.toString()!;
    return false;
  }
}
