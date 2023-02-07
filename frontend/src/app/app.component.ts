import {Component, OnInit} from '@angular/core';
import {KeycloakService} from 'keycloak-angular';
import {NavigationEnd, Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'RescueMapCreator';

  authenticated: boolean = false;
  roles: string[] = [];
  name: string = '';

  showMode: boolean = false;


  constructor(
    private keycloakService: KeycloakService,
    private window: Window,
    private router: Router
  ) {
  }

  async ngOnInit() {
    this.authenticated = await this.keycloakService.isLoggedIn();
    if (this.authenticated) {
      this.keycloakService.loadUserProfile().then((profile) => {
        this.name = profile.firstName + ' ' + profile.lastName;
      });

      this.roles = this.keycloakService.getUserRoles(true);


    }
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showMode = event.url.startsWith('/show');
      }
    });
  }

  login() {
    this.keycloakService.login();
  }

  logout() {
    this.keycloakService.logout(this.window.location.origin);
  }
}
