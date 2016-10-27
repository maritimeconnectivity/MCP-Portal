import {Injectable, OnInit} from '@angular/core';
import {RolesService} from "../../backend-api/identity-registry/services/roles.service";
import {MCNotificationsService, MCNotificationType} from "../../shared/mc-notifications.service";
import {Role} from "../../backend-api/identity-registry/autogen/model/Role";
import RoleNameEnum = Role.RoleNameEnum;


export enum AuthPermission {Member, Admin, SysAdmin}

export interface AuthState {
  loggedIn: boolean,
  permission: AuthPermission,
  orgMrn: string,
  isAdmin(): boolean
}

@Injectable()
export class AuthService implements OnInit {
  private static staticAuth: any = {};

  // We make a state-object to take advantage of Angulars build in "object-observer", so when a value in authState is changing, all views using the state-object will be updated
  public authState: AuthState;

  constructor(private rolesService: RolesService, private notificationService: MCNotificationsService) {
    this.authState = this.createAuthState();
    AuthService.staticAuth.notificationService = notificationService;
    this.findPermissionRoles();
  }

  ngOnInit() {
  }
  private findPermissionRoles() {
    if (this.authState.loggedIn) {
      this.rolesService.getMyRoles(this.authState.orgMrn).subscribe(
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
          this.notificationService.generateNotification('Error', 'Error trying to fetch user permissions', MCNotificationType.Error);
        }
      );
    }
  }
  private createAuthState(): AuthState {
    return {
      loggedIn: AuthService.staticAuth.loggedIn,
      permission: AuthPermission.Member,
      orgMrn: AuthService.staticAuth.orgMrn,
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
              AuthService.staticAuth.orgMrn =  keycloakAuth.tokenParsed.org;
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

  static refreshToken(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (AuthService.staticAuth.authz.token) {
        AuthService.staticAuth.authz.updateToken(30)
          .success(() => {
            resolve(<string>AuthService.staticAuth.authz.token);
          })
          .error(() => {
            AuthService.handle401();
          });
      }
    });
  }
  static getToken(): string {
    try {
      if (AuthService.staticAuth.authz.token && !AuthService.staticAuth.authz.isTokenExpired(30)) {
        return AuthService.staticAuth.authz.token;
      } else {
        AuthService.handle401();
      }
    } catch ( error ) {
      AuthService.handle401();
    }
  }
  private static handle401() {
    AuthService.staticAuth.loggedIn = false;
    AuthService.staticAuth.authz.logout({redirectUri:  window.location.origin + '/#' + AuthService.staticAuth.logoutUrl + '?reason=401'});
    AuthService.staticAuth.authz = null;
  }

}
