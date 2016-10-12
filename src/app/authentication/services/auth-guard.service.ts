import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from "@angular/router";
import {AuthService} from "./auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;

    return this.checkLogin(url);
  }

  checkLogin(url: string): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    }

    // Navigate to the login page
    this.router.navigate([this.authService.loginUrl()]);
    console.log('AuthGuard#canActivate called');
    return false;
  }


  constructor(private router: Router, private authService: AuthService) {
    console.log('AuthGuard#constructor called');
  }
}
