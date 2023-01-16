import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule} from '@angular/material/menu';
import { TileComponent } from './tile/tile.component';
import { CreateEditComponent } from './create-edit.component';
import { DragDropModule } from '@angular/cdk/drag-drop';


@NgModule({
  declarations: [
    TileComponent,
    CreateEditComponent,
  ],
  imports: [
    CommonModule,
    MatMenuModule,
    DragDropModule,
  ]
})
export class CreateEditModule { }
