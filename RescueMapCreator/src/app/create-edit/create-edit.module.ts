import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule} from '@angular/material/menu';
import { TileComponent } from './tile/tile.component';
import { CreateEditComponent } from './create-edit.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { GridCanvasComponent } from './grid-canvas/grid-canvas.component';


@NgModule({
  declarations: [
    TileComponent,
    CreateEditComponent,
    GridCanvasComponent,
  ],
  imports: [
    CommonModule,
    MatMenuModule,
    DragDropModule,
  ]
})
export class CreateEditModule { }
