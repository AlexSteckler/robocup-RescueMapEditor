import {APP_INITIALIZER, ErrorHandler, LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HomeComponent} from './home/home.component';
import {SettingsComponent} from './settings/settings.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';
import {CreateEditModule} from './create-edit/create-edit.module';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {ToastrModule, ToastrService} from 'ngx-toastr';
import {KeycloakAngularModule, KeycloakService} from 'keycloak-angular';
import {environment} from 'src/environments/environment';
import {CreateTileComponent} from './settings/create-tile/create-tile.component';
import {FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {CreateObstacleComponent} from './settings/create-obstacle/create-obstacle.component';
import {GlobalErrorHandler} from "./shared/GlobalErrorHandler";
import {MatTooltipModule} from '@angular/material/tooltip';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import {GetMapsForCategoryPipe} from "./home/pipe/pipe";

function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: {
        url: environment.kUrl,
        realm: environment.kRealm,
        clientId: environment.kClientId,
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri:
          window.location.origin + '/assets/silent-check-sso.html',
      },
    });
}

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        SettingsComponent,
        CreateTileComponent,
        CreateObstacleComponent,
        GetMapsForCategoryPipe,
    ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService],
    },
    {provide: Window, useValue: window},
    {provide: ErrorHandler, useClass: GlobalErrorHandler},
    {provide: LOCALE_ID, useValue: 'fr'},
    ToastrService,
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    CreateEditModule,
    MatSnackBarModule,
    KeycloakAngularModule,
    ToastrModule.forRoot(),
    FormsModule,
    MatExpansionModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatTooltipModule,
    NgbTooltip,
  ]
})
export class AppModule {
}
