import {Component, HostListener} from '@angular/core';
import { Transform } from 'panzoom';
import { Tile } from './tile/dto/tile.dto';

@Component({
  selector: 'app-create-edit',
  templateUrl: './create-edit.component.html',
  styleUrls: ['./create-edit.component.scss']
})
export class CreateEditComponent {
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.innerHeight = window.innerHeight - 300;
  }

  isInTrash: boolean = false;
  currentDraggedTile: Tile | undefined;
  canvasValues: Transform | undefined;
  evacuationExists: boolean = false;
  innerHeight: number = 0;

  ngOnInit(): void {
    this.innerHeight = window.innerHeight - 240;
  }
}