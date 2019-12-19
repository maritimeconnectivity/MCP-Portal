import {Injectable, OnInit, EventEmitter} from '@angular/core';
import {RolesService} from "../../backend-api/identity-registry/services/roles.service";
import {MCNotificationsService, MCNotificationType} from "../../shared/mc-notifications.service";
import {Role} from "../../backend-api/identity-registry/autogen/model/Role";
import RoleNameEnum = Role.RoleNameEnum;
import {User} from "../../backend-api/identity-registry/autogen/model/User";


export enum AuthPermission {
	User    = 1 << 0,
	OrgAdmin = 1 << 1,
	SiteAdmin = 1 << 2,
	UserAdmin = 1 << 3,
	VesselAdmin = 1 << 4,
	ServiceAdmin = 1 << 5,
	DeviceAdmin = 1 << 6,
	ApproveOrg = 1 << 7,
	EntityAdmin = 1 << 8
}

export interface AuthUser extends User {
	organization:string,
	preferredUsername:string,
	keycloakPermissions:string
}

export interface AuthState {
  loggedIn: boolean,
  permission: any,
  orgMrn: string,
	user: AuthUser,
  rolesLoaded: boolean,
	acting: boolean,
	hasPermission(permissionRole: AuthPermission): boolean;
}

interface StaticAuthInfo {
	loggedIn?: boolean,
	logoutUrl?:string,
	permission?: any,
	orgMrn?: string,
	user?: AuthUser
	authz?: any
}

class PermissionResolver {
	static isSiteAdmin(permission: AuthPermission) {
		return (permission & AuthPermission.SiteAdmin) > 0;
	}

	static isOrgAdmin(permission: AuthPermission) {
		return (permission & AuthPermission.OrgAdmin) > 0 || this.isSiteAdmin(permission);
	}

	static isEntityAdmin(permission: AuthPermission) {
		 return (permission & AuthPermission.EntityAdmin) > 0 || this.isOrgAdmin(permission);
	}

    static isUserAdmin(permission: AuthPermission) {
        return (permission & AuthPermission.UserAdmin) > 0 || this.isEntityAdmin(permission);
    }

	static isVesselAdmin(permission: AuthPermission) {
		return (permission & AuthPermission.VesselAdmin) > 0 || this.isEntityAdmin(permission);
	}

	static isDeviceAdmin(permission: AuthPermission) {
		return (permission & AuthPermission.DeviceAdmin) > 0 || this.isEntityAdmin(permission);
	}

	static isServiceAdmin(permission: AuthPermission) {
		return (permission & AuthPermission.ServiceAdmin) > 0 || this.isEntityAdmin(permission);
	}

	static canApproveOrg(permission: AuthPermission) {
		return (permission & AuthPermission.ApproveOrg) > 0 || this.isSiteAdmin(permission);
	}
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
          	let role = RoleNameEnum[roleString];
          	switch (role) {
				case RoleNameEnum[RoleNameEnum.ORGADMIN]: {
                    this.authState.permission = this.authState.permission | AuthPermission.OrgAdmin;
                    break;
                }
				case RoleNameEnum[RoleNameEnum.SITEADMIN]: {
                    this.authState.permission = this.authState.permission | AuthPermission.SiteAdmin;
                    break;
                }
				case RoleNameEnum[RoleNameEnum.USERADMIN]: {
                    this.authState.permission = this.authState.permission | AuthPermission.UserAdmin;
                    break;
                }
				case RoleNameEnum[RoleNameEnum.DEVICEADMIN]: {
                    this.authState.permission = this.authState.permission | AuthPermission.DeviceAdmin;
                    break;
                }
				case RoleNameEnum[RoleNameEnum.VESSELADMIN]: {
                    this.authState.permission = this.authState.permission | AuthPermission.VesselAdmin;
                    break;
                }
				case RoleNameEnum[RoleNameEnum.SERVICEADMIN]: {
                    this.authState.permission = this.authState.permission | AuthPermission.ServiceAdmin;
                    break;
                }
				case RoleNameEnum[RoleNameEnum.ENTITYADMIN]: {
                    this.authState.permission = this.authState.permission | AuthPermission.EntityAdmin;
                    break;
                }
				case RoleNameEnum[RoleNameEnum.APPROVEORG]: {
                    this.authState.permission = this.authState.permission | AuthPermission.ApproveOrg;
                	break;
				}
				default:
					this.authState.permission = this.authState.permission | AuthPermission.User;
            }
          }
          this.authState.rolesLoaded = true;
          this.rolesLoaded.emit('');
        },
        error => {
          this.authState.permission = AuthPermission.User;
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
      permission: AuthPermission.User,
      orgMrn: AuthService.staticAuthInfo.orgMrn,
	    user: AuthService.staticAuthInfo.user,
      rolesLoaded: false,
		acting: false,
		hasPermission(permissionRole: AuthPermission): boolean {
			switch (permissionRole) {
				case AuthPermission.User:
					return true;
				case AuthPermission.SiteAdmin:
					return PermissionResolver.isSiteAdmin(this.permission);
				case AuthPermission.OrgAdmin:
					return PermissionResolver.isOrgAdmin(this.permission);
				case AuthPermission.ApproveOrg:
					return PermissionResolver.canApproveOrg(this.permission);
				case AuthPermission.EntityAdmin:
					return PermissionResolver.isEntityAdmin(this.permission);
				case AuthPermission.ServiceAdmin:
					return PermissionResolver.isServiceAdmin(this.permission);
				case AuthPermission.DeviceAdmin:
					return PermissionResolver.isDeviceAdmin(this.permission);
				case AuthPermission.VesselAdmin:
					return PermissionResolver.isVesselAdmin(this.permission);
				case AuthPermission.UserAdmin:
					return PermissionResolver.isUserAdmin(this.permission);
				default:
					return false;
            }
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
	  let permissions = keycloakToken.permissions ? keycloakToken.permissions : '';
	  let mrn = keycloakToken.mrn;
	  let email= keycloakToken.email;
	  let preferredUsername= keycloakToken.preferred_username ? keycloakToken.preferred_username : '';
	  let authUser:AuthUser = {firstName:firstname, lastName:lastname, mrn:mrn, email:email, organization:keycloakToken.org, preferredUsername:preferredUsername, keycloakPermissions:permissions};
	  AuthService.staticAuthInfo.user = authUser;
  }

  isMyOrg(orgMrn:string){
	  return this.authState.orgMrn === orgMrn;
  }

  loginUrl(): string {
    return "/login";
  }

  login() {
  	let url = window.location;
    AuthService.staticAuthInfo.authz.login({redirectUri:  url.protocol + "//" + url.host + "/"});
  }

  logout() {
	  try {
		  this.authState.loggedIn = false;
		  AuthService.staticAuthInfo.authz.logout();
		  AuthService.staticAuthInfo.authz = null;
	  }catch (err) { // State is somehow lost. Just do nothing.

	  }
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
		try {
			AuthService.staticAuthInfo.loggedIn = false;
			AuthService.staticAuthInfo.authz.logout({redirectUri: window.location.origin + '/#' + AuthService.staticAuthInfo.logoutUrl + '?reason=401'});
			AuthService.staticAuthInfo.authz = null;
		}catch (err) { // State is somehow lost. Just do nothing.

		}
	}

	public static handleCacheError() {
		try {
			AuthService.staticAuthInfo.loggedIn = false;
			AuthService.staticAuthInfo.authz.logout({redirectUri: window.location.origin + '/#' + AuthService.staticAuthInfo.logoutUrl + '?reason=cache'});
			AuthService.staticAuthInfo.authz = null;
		}catch (err) { // State is somehow lost. Just do nothing.

		}
	}

}
