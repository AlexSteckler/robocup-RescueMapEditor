import {APP_INITIALIZER, LOCALE_ID, NgModule} from '@angular/core';
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
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { environment } from 'src/environments/environment';

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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    CreateEditModule,
    MatSnackBarModule,
    KeycloakAngularModule,
    ToastrModule.forRoot()
  ],
  providers: [
    {
    provide: APP_INITIALIZER,
    useFactory: initializeKeycloak,
    multi: true,
    deps: [KeycloakService],
  },
  {provide: Window, useValue: window},
  {provide: LOCALE_ID, useValue: 'fr'},
  ToastrService],
  bootstrap: [AppComponent]
})
export class AppModule { }
