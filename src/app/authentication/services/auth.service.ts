import {Injectable, OnInit, EventEmitter} from '@angular/core';
import {RolesService} from "../../backend-api/identity-registry/services/roles.service";
import {MCNotificationsService, MCNotificationType} from "../../shared/mc-notifications.service";
import {Role} from "../../backend-api/identity-registry/autogen/model/Role";
import RoleNameEnum = Role.RoleNameEnum;
import {User} from "../../backend-api/identity-registry/autogen/model/User";


export enum AuthPermission {
	Member    = 1 << 0,
	Admin     = 1 << 1,
	SiteAdmin = 1 << 2
}

export interface AuthUser extends User {
	organization:string,
	preferredUsername:string
}

export interface AuthState {
  loggedIn: boolean,
  permission: any,
  orgMrn: string,
	user: AuthUser,
  rolesLoaded: boolean,
	isAdmin(): boolean,
	isSiteAdmin(): boolean
}

interface StaticAuthInfo {
	loggedIn?: boolean,
	logoutUrl?:string,
	permission?: any,
	orgMrn?: string,
	user?: AuthUser
	authz?: any
}
@Injectable()
export class AuthService implements OnInit {
  public static staticAuthInfo: StaticAuthInfo = {}; // This is needed to save some information about user, because these informations is found before this class is initiated

	public rolesLoaded: EventEmitter<any> = new EventEmitter<any>();

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
      this.rolesService.getMyRoles(this.authState.orgMrn).subscribe(
        roles => {
          for (let roleString of roles) {
	          if (RoleNameEnum[roleString] === RoleNameEnum[RoleNameEnum.ORGADMIN]) {
		          this.authState.permission = this.authState.permission | AuthPermission.Admin;
	          }
	          if (RoleNameEnum[roleString] === RoleNameEnum[RoleNameEnum.SITEADMIN]) {
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
      loggedIn: AuthService.staticAuthInfo.loggedIn,
      permission: AuthPermission.Member,
      orgMrn: AuthService.staticAuthInfo.orgMrn,
	    user: AuthService.staticAuthInfo.user,
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
    let keycloakAuth: any = new Keycloak(KEYCLOAK_JSON);
    AuthService.staticAuthInfo.loggedIn = false;

    return new Promise((resolve, reject) => {
      keycloakAuth.init({ onLoad: 'check-sso' })
        .success((authenticated) => {
          if (authenticated) {
            AuthService.staticAuthInfo.loggedIn = true;

	          AuthService.parseAuthInfo(keycloakAuth.tokenParsed);

	          keycloakAuth.onAuthLogout = function() {
		          console.log("USER LOGGED OUT");
		          AuthService.handle401();
	          };
	          keycloakAuth.onTokenExpired = function() {
		          console.log("TOKEN EXPIRED LOGGED OUT");
	          };
          } else {
            AuthService.staticAuthInfo.loggedIn = false;
          }
          AuthService.staticAuthInfo.authz = keycloakAuth;
          AuthService.staticAuthInfo.logoutUrl = "/login";
          resolve();
        })
        .error(() => {
          reject();
        });
    });
  }

  private static parseAuthInfo(keycloakToken:any) {
  	if (!keycloakToken) {
		  throw new Error('Keycloak token parse error: Token not present');
	  }
	  if (!keycloakToken.org) {
		  throw new Error("Keycloak token parse error: 'org' not present");
	  }
	  if (!keycloakToken.mrn) {
		  throw new Error("Keycloak token parse error: 'mrn' not present");
	  }
	  if (!keycloakToken.email) {
		  throw new Error("Keycloak token parse error: 'email' not present");
	  }

	  AuthService.staticAuthInfo.orgMrn =  keycloakToken.org;
	  let firstname = keycloakToken.given_name ? keycloakToken.given_name : '';
	  let lastname = keycloakToken.family_name ? keycloakToken.family_name : '';
	  let mrn = keycloakToken.mrn;
	  let email= keycloakToken.email;
	  let preferredUsername= keycloakToken.preferred_username ? keycloakToken.preferred_username : '';
	  let authUser:AuthUser = {firstName:firstname, lastName:lastname, mrn:mrn, email:email, organization:keycloakToken.org, preferredUsername:preferredUsername};
	  AuthService.staticAuthInfo.user = authUser;
  }

  isMyOrg(orgMrn:string){
	  return this.authState.orgMrn === orgMrn;
  }

  loginUrl(): string {
    return "/login";
  }

  login() {
    AuthService.staticAuthInfo.authz.login({redirectUri:  '/'});
  }

  logout() {
    this.authState.loggedIn = false;
    AuthService.staticAuthInfo.authz.logout();
    AuthService.staticAuthInfo.authz = null;
  }

  static getToken(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (AuthService.staticAuthInfo.authz.token) {
        AuthService.staticAuthInfo.authz.updateToken(30)
          .success(() => {
            resolve(<string>AuthService.staticAuthInfo.authz.token);
          })
          .error((error) => {
            AuthService.handle401();
          });
      }
    });
  }

  public static handle401() {
    AuthService.staticAuthInfo.loggedIn = false;
    AuthService.staticAuthInfo.authz.logout({redirectUri:  window.location.origin + '/#' + AuthService.staticAuthInfo.logoutUrl + '?reason=401'});
    AuthService.staticAuthInfo.authz = null;
  }

}
