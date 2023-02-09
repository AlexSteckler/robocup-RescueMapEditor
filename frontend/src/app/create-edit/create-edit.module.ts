import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule} from '@angular/material/menu';
import { TileComponent } from './tile/tile.component';
import { CreateEditComponent } from './create-edit.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { GridCanvasComponent } from './grid-canvas/grid-canvas.component';
import { TileSelectionComponent } from './tile-selection/tile-selection.component';
import { ObstacleComponent } from './obstacle/obstacle.component';
import { ToogleComponent } from '../shared/toogle/toogle.component';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';



@NgModule({
    declarations: [
        TileComponent,
        CreateEditComponent,
        GridCanvasComponent,
        TileSelectionComponent,
        ObstacleComponent,
        ToogleComponent,
    ],
    exports: [
        TileComponent,
        ObstacleComponent
    ],
    imports: [
        CommonModule,
        MatMenuModule,
        DragDropModule,
        NgbModalModule
    ]
})
export class CreateEditModule { }
