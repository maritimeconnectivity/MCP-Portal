import {Injectable, OnInit, EventEmitter} from '@angular/core';
import {RolesService} from "../../backend-api/identity-registry/services/roles.service";
import {MCNotificationsService, MCNotificationType} from "../../shared/mc-notifications.service";
import {Role} from "../../backend-api/identity-registry/autogen/model/Role";
import RoleNameEnum = Role.RoleNameEnum;


export enum AuthPermission {
	Member    = 1 << 0,
	Admin     = 1 << 1,
	SiteAdmin = 1 << 2
}

export interface AuthState {
  loggedIn: boolean,
  permission: any,
  orgMrn: string,
  rolesLoaded: boolean,
	isAdmin(): boolean,
	isSiteAdmin(): boolean
}

@Injectable()
export class AuthService implements OnInit {
  private static staticAuth: any = {};

	public rolesLoaded: EventEmitter<any> = new EventEmitter<any>();

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
		          this.authState.permission = this.authState.permission | AuthPermission.Admin;
	          }
	          if (roleString === RoleNameEnum[RoleNameEnum.ROLE_SITE_ADMIN]) {
		          this.authState.permission = this.authState.permission | AuthPermission.SiteAdmin;
	          }
          }
          this.authState.rolesLoaded = true;
          this.rolesLoaded.emit('');
        },
        error => {
          this.authState.permission = AuthPermission.Member;
          this.notificationService.generateNotification('Error', 'Error trying to fetch user permissions', MCNotificationType.Error, error);
	        this.authState.rolesLoaded = true;
	        this.rolesLoaded.emit('');
        }
      );
    }
  }
  private createAuthState(): AuthState {
    return {
      loggedIn: AuthService.staticAuth.loggedIn,
      permission: AuthPermission.Member,
      orgMrn: AuthService.staticAuth.orgMrn,
      rolesLoaded: false,
	    isAdmin() {
		    return (this.permission & AuthPermission.Admin || this.permission & AuthPermission.SiteAdmin) > 0;
	    },
	    isSiteAdmin() {
		    return (this.permission & AuthPermission.SiteAdmin) > 0;
	    }
    };
  }

  static init(): Promise<any> {
    let keycloakAuth: any = new Keycloak('assets/keycloak.json');
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
            if (keycloakAuth.tokenParsed && keycloakAuth.tokenParsed.preferred_username) {
              AuthService.staticAuth.user =  keycloakAuth.tokenParsed.preferred_username;
            } else {
              throw new Error('Keycloak token parse error');
            }
	          keycloakAuth.onAuthLogout = function() {
		          console.log("USER LOGGED OUT");
		          AuthService.handle401();
	          };
	          keycloakAuth.onTokenExpired = function() {
		          console.log("TOKEN EXPIRED LOGGED OUT");
		          AuthService.handle401();
	          };
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

  isMyOrg(orgMrn:string){
	  return this.authState.orgMrn === orgMrn;
  }

  loginUrl(): string {
    return "/login";
  }

  login() {
    AuthService.staticAuth.authz.login({redirectUri:  '/'});
  }

  logout() {
    this.authState.loggedIn = false;
    AuthService.staticAuth.authz.logout();
    AuthService.staticAuth.authz = null;
  }

  static getToken(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (AuthService.staticAuth.authz.token) {
        AuthService.staticAuth.authz.updateToken(30)
          .success(() => {
            resolve(<string>AuthService.staticAuth.authz.token);
          })
          .error((error) => {
            AuthService.handle401();
          });
      }
    });
  }

  public static handle401() {
    AuthService.staticAuth.loggedIn = false;
    AuthService.staticAuth.authz.logout({redirectUri:  window.location.origin + '/#' + AuthService.staticAuth.logoutUrl + '?reason=401'});
    AuthService.staticAuth.authz = null;
  }

}
