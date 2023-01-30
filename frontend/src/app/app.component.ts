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
  roles: string[] = [];
  name: string = '';


  constructor(
    private keycloakService: KeycloakService,
    private window: Window,
    ) {}

  async ngOnInit() {
    this.authenticated = await this.keycloakService.isLoggedIn();
    this.keycloakService.loadUserProfile().then((profile) => {
      this.name = profile.firstName + ' ' + profile.lastName;
    });

    this.roles = this.keycloakService.getUserRoles(true);
  }

  login() {
    this.keycloakService.login();
  }

  logout() {
    this.keycloakService.logout(this.window.location.origin);
  }
}
