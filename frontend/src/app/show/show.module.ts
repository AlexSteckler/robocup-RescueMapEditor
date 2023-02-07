import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShowRoutingModule } from './show-routing.module';
import {ShowComponent} from "./show.component";
import {CreateEditModule} from "../create-edit/create-edit.module";


@NgModule({
  declarations: [ShowComponent],
  imports: [
    CommonModule,
    ShowRoutingModule,
    CreateEditModule
  ]
})
export class ShowModule { }
