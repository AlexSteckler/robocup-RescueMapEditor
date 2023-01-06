import {Component, Input} from '@angular/core';
import {Tile} from "./dto/tile.dto";
import { TilesService } from './tiles.service';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss']
})
export class TileComponent {
  @Input() tile: Tile | undefined;

  constructor(
    private tileService : TilesService
  )
  {
    console.log(this.tile);
  }
}
