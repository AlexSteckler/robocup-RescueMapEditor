import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {UserProfileRoutingModule} from './user-profile-routing.module';
import {ToastrModule, ToastrService} from "ngx-toastr";
import {UserProfileComponent} from "./user-profile.component";
import {ReactiveFormsModule} from "@angular/forms";


@NgModule({
  declarations: [
    UserProfileComponent
  ],
  imports: [
    CommonModule,
    UserProfileRoutingModule,
    ToastrModule.forRoot(),
    ReactiveFormsModule
  ],
  providers: [
    ToastrService
  ]
})
export class UserProfileModule {
}
