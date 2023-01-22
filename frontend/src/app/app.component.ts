import { Component } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'RescueMapCreator';

  authenticated : boolean = false;

  constructor(
    private keycloakService: KeycloakService,
    private window: Window,
    ) {}

  async ngOnInit() {
    this.authenticated = await this.keycloakService.isLoggedIn();
  }

  login() {
    this.keycloakService.login();
  }

  logout() {
    this.keycloakService.logout(this.window.location.origin);
  }
}
