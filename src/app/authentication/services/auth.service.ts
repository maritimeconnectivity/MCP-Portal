import { Injectable } from '@angular/core';

@Injectable()
export class AuthService {

  static auth: any = {};

  static init(): Promise<any> {
    let keycloakAuth: any = new Keycloak('keycloak.json');
    AuthService.auth.loggedIn = false;

    return new Promise((resolve, reject) => {
      keycloakAuth.init({ onLoad: 'check-sso' })
        .success((authenticated) => {
          if (authenticated) {
            AuthService.auth.loggedIn = true;
          } else {
            AuthService.auth.loggedIn = false;
          }
          AuthService.auth.authz = keycloakAuth;
          AuthService.auth.logoutUrl = "/login";
          resolve();
        })
        .error(() => {
          reject();
        });
    });
  }

  loginUrl(): string {
    return "/login";
  }

  isLoggedIn(): boolean {
    return AuthService.auth.loggedIn;
  }

  login() {
    console.log('*** LOGIN');
    AuthService.auth.authz.login({redirectUri:  '/'});
  }

  logout() {
    AuthService.auth.loggedIn = false;
    AuthService.auth.authz.logout({redirectUri:  window.location.origin + '/#' + AuthService.auth.logoutUrl});
    AuthService.auth.authz = null;


    // window.location.href = KeycloakService.auth.logoutUrl;
  }

  getToken(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (AuthService.auth.authz.token) {
        AuthService.auth.authz.updateToken(5)
          .success(() => {
            resolve(<string>AuthService.auth.authz.token);
          })
          .error(() => {
            // TODO: måske denne error skal kalde noget generelt error-ting, så jeg ikke skal gøre det hver gang jeg kalder getToken
            reject('Failed to refresh token');
          });
      }
    });
  }

}
