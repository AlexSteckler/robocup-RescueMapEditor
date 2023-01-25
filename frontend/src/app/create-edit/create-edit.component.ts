import { Component, HostListener } from '@angular/core';
import { Transform } from 'panzoom';
import { Tile } from './tile/dto/tile.dto';

@Component({
  selector: 'app-create-edit',
  templateUrl: './create-edit.component.html',
  styleUrls: ['./create-edit.component.scss'],
})
export class CreateEditComponent {
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.innerHeight = window.innerHeight - 300;
  }

  isInTrash: boolean = false;
  currentDraggedTile: Tile | undefined;
  canvasValues: Transform | undefined;
  evacuationExists: boolean = true;
  innerHeight: number = 0;
  innerWidth: number = 0;

  ngOnInit(): void {
    this.innerHeight = window.innerHeight - 240;
    this.innerWidth = window.innerWidth;
  }
}
