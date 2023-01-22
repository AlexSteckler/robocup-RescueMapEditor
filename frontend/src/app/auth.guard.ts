import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree,} from '@angular/router';
import {KeycloakAuthGuard, KeycloakService} from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard extends KeycloakAuthGuard {
  constructor(
    protected override router: Router,
    protected keycloakService: KeycloakService
  ) {
    super(router, keycloakService);
  }

  async isAccessAllowed(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    const requiredRoles: string[] = route.data['roles'] || [];

    if (!(requiredRoles instanceof Array) || requiredRoles.length === 0) {
      return true;
    }

    let back = false;
    requiredRoles.forEach((role) => {
      if (this.roles.includes(role)) {
        back = true;
      }
    });
    /*let back = requiredRoles.every((role) => {
      this.roles.includes(role)
    });*/
    if (!back) {
      await this.router.navigateByUrl('/');
    }
    return back;
  }
}
