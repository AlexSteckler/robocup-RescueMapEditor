import { NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';

import { VolunteersRoutingModule } from './volunteers-routing.module';
import { MatTableModule} from "@angular/material/table";
import { VolunteersComponent } from "./volunteers.component";


@NgModule({
  declarations: [VolunteersComponent],
  imports: [
    CommonModule,
    VolunteersRoutingModule,
    MatTableModule
  ]
})
export class VolunteersModule {
}
