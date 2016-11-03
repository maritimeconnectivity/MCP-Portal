import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from "@angular/router";
import {AuthService} from "./auth.service";

@Injectable()
export class SiteAdminAuthGuard implements CanActivate {
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;

    return this.checkState(url);
  }

  checkState(url: string): boolean {
	  return this.authService.authState.isSiteAdmin()
  }

  constructor(private router: Router, private authService: AuthService) {
  }
}
