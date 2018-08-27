import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { AuthPermission, AuthService } from "./auth.service";

@Injectable()
export class SiteAdminAuthGuard implements CanActivate {
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;

    return this.checkState(url);
  }

  checkState(url: string): boolean {
	  return this.authService.authState.hasPermission(AuthPermission.SiteAdmin)
  }

  constructor(private router: Router, private authService: AuthService) {
  }
}
