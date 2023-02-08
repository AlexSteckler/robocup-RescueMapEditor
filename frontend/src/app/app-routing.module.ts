import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

import { CreateEditComponent } from './create-edit/create-edit.component';
import { HomeComponent } from './home/home.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  {
    path: 'createEdit/:id',
    component: CreateEditComponent,
    canActivate: [AuthGuard],
    data: {
      roles: ['quali', 'admin'],
    },
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    data: {
      public: true,
    },
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AuthGuard],
    data: {
      roles: ['quali', 'admin'],
    },
  },
  {
    path: 'show',
    loadChildren: () => import('./show/show.module').then((m) => m.ShowModule),
    canActivate: [AuthGuard],
    data: {
      public: true,
    }
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
