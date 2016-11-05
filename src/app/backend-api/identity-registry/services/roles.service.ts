import {Injectable, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {RolecontrollerApi} from "../autogen/api/RolecontrollerApi";
import {Role} from "../autogen/model/Role";

@Injectable()
export class RolesService implements OnInit {
  constructor(private rolesApi: RolecontrollerApi) {
  }

  ngOnInit() {
  }

	public createRole (orgMrn: string, role: Role) : Observable<Role> {
		return this.rolesApi.createRoleUsingPOST(orgMrn, role);
	}

  public getMyRoles(orgMrn:string): Observable<Array<string>> {
    return this.rolesApi.getMyRoleUsingGET(orgMrn);
  }
}
