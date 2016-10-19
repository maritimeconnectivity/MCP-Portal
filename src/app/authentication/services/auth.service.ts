import {Injectable, OnInit} from '@angular/core';
import {RolesService} from "../../backend-api/identity-registry/services/roles.service";
import {MCNotificationsService, MCNotificationType} from "../../shared/mc-notifications.service";
import {Role} from "../../backend-api/identity-registry/autogen/model/Role";
import RoleNameEnum = Role.RoleNameEnum;


export enum AuthPermission {Member, Admin, SysAdmin}

export interface AuthState {
  loggedIn: boolean,
  permission: AuthPermission,
  orgShortName: string,
  isAdmin(): boolean
}

@Injectable()
export class AuthService implements OnInit {

  private static staticAuth: any = {};

  // We make a state-object to take advantage of Angulars build in "object-observer", so when a value in authState is changing, all views using the state-object will be updated
  public authState: AuthState;

  constructor(private rolesService: RolesService, private notificationService: MCNotificationsService) {
    this.authState = this.createAuthState();
    this.findPermissionRoles();
  }

  ngOnInit() {
  }
  private findPermissionRoles() {
    if (this.authState.loggedIn) {
      this.rolesService.getMyRoles(this.authState.orgShortName).subscribe(
        roles => {
          for (let roleString of roles) {
            if (roleString === RoleNameEnum[RoleNameEnum.ROLE_ORG_ADMIN]) {
              this.authState.permission = AuthPermission.Admin;
              break;
            }
          }
        },
        error => {
          this.authState.permission = AuthPermission.Member;
          this.notificationService.generateNotification({title:'Error', message:'Error trying to fetch user permissions', type:MCNotificationType.Error});
        }
      );
    }
  }
  private createAuthState(): AuthState {
    return {
      loggedIn: AuthService.staticAuth.loggedIn,
      permission: AuthPermission.Member,
      orgShortName: AuthService.staticAuth.orgShortName,
      isAdmin() {
        return this.permission === AuthPermission.Admin || this.permission === AuthPermission.SysAdmin;
      }
    };
  }

  static init(): Promise<any> {
    let keycloakAuth: any = new Keycloak('keycloak.json');
    AuthService.staticAuth.loggedIn = false;

    return new Promise((resolve, reject) => {
      keycloakAuth.init({ onLoad: 'check-sso' })
        .success((authenticated) => {
          if (authenticated) {
            AuthService.staticAuth.loggedIn = true;
            if (keycloakAuth.tokenParsed && keycloakAuth.tokenParsed.org) {
              AuthService.staticAuth.orgShortName =  keycloakAuth.tokenParsed.org;
            } else {
              throw new Error('Keycloak token parse error');
            }
          } else {
            AuthService.staticAuth.loggedIn = false;
          }
          AuthService.staticAuth.authz = keycloakAuth;
          AuthService.staticAuth.logoutUrl = "/login";
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

  login() {
    console.log('*** LOGIN');
    AuthService.staticAuth.authz.login({redirectUri:  '/'});
  }

  logout() {
    this.authState.loggedIn = false;
    AuthService.staticAuth.authz.logout({redirectUri:  window.location.origin + '/#' + AuthService.staticAuth.logoutUrl});
    AuthService.staticAuth.authz = null;
  }

  static getToken(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (AuthService.staticAuth.authz.token) {
        AuthService.staticAuth.authz.updateToken(5)
          .success(() => {
            resolve(<string>AuthService.staticAuth.authz.token);
          })
          .error(() => {
            // TODO: måske denne error skal kalde noget generelt error-ting, så jeg ikke skal gøre det hver gang jeg kalder getToken
            reject('Failed to refresh token');
          });
      }
    });
  }

}
