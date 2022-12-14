import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CreateEditComponent } from './create-edit/create-edit.component';
import { HomeComponent } from './home/home.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
{
  path: 'createEdit', component:CreateEditComponent
},
{
  path: 'home', component:HomeComponent
},
{
  path: 'settings', component:SettingsComponent
},
{
  path: '**',
  redirectTo: 'home'
}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
