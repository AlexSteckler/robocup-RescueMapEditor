import {Component, Input} from '@angular/core';
import {Tile} from "./dto/tile.dto";

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss']
})
export class TileComponent {
  @Input() tile: Tile | undefined;

}
