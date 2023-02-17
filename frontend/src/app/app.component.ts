import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {KeycloakService} from 'keycloak-angular';
import {NavigationEnd, Router} from "@angular/router";
import {GlobalErrorHandler} from "./shared/GlobalErrorHandler";
import {ToastrService} from "ngx-toastr";
import { KeycloakProfile } from 'keycloak-js';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserProfileService } from './user-profile/user-profile.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('chooseRoleModal') chooseRoleModal: ElementRef | undefined;
  title = 'RescueMapCreator';

  userProfile: KeycloakProfile | null = null;
  authenticated: boolean = false;
  roles: string[] = [];
  name: string = '';
  location: string = ""

  showMode: boolean = false;


  constructor(
    private keycloakService: KeycloakService,
    private window: Window,
    private router: Router,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private userService: UserProfileService,
  ) {
    GlobalErrorHandler.toastr = toastr;
  }

  async ngOnInit() {
    this.authenticated = await this.keycloakService.isLoggedIn();
    if (this.authenticated) {
      this.keycloakService.loadUserProfile().then((profile) => {
        this.userProfile = profile;
        this.name = profile.firstName + ' ' + profile.lastName;
      });
      this.roles = this.keycloakService.getUserRoles(true);

        if (this.roles.length <= 4) {
          this.registerMapper();
        } else {
          if(this.roles.includes('volunteer') && (this.userProfile as any).attributes && !(this.userProfile as any).attributes.location) {
            this.toastr.info('Sie sind keinem Standort zugeordnet. Bitte wenden Sie sich an das Support Team', 'Kein Standort zugewiesen', {
              timeOut: 0,
              extendedTimeOut: 0,
              closeButton: true,
            });
          }
        }

    }
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showMode = event.url.startsWith('/show');
      }
    });
  }

  private registerMapper() {
    this.modalService.open(this.chooseRoleModal, {
      centered: true,
      fullscreen: true,
      keyboard: false,
      backdrop: false,
    })
      .result
      .then(
        (result) => {
          if (result === 'logout') {
            this.logout();
            return;
          }
          this.userService.registerMapper(this.location).subscribe(() => {
            this.toastr.success('Registrierung erfolgreich');
            this.router.navigate(['']).then(() => {
              window.location.reload();
            });
          });
        });
  }


  login() {
    this.keycloakService.login();
  }

  logout() {
    this.keycloakService.logout(this.window.location.origin);
  }
}
