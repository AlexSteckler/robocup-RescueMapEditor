import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import {enableProdMode, isDevMode} from '@angular/core';

import { AppModule } from './app/app.module';
import {environment} from "./environments/environment";

if (environment.production) {
  enableProdMode();
}

if (!isDevMode()) {
  window.console.log = () => {
  };
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
