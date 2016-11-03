import {Injectable, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {RolecontrollerApi} from "../autogen/api/RolecontrollerApi";

@Injectable()
export class RolesService implements OnInit {
  constructor(private rolesApi: RolecontrollerApi) {
  }

  ngOnInit() {
  }

  public getMyRoles(orgMrn:string): Observable<Array<string>> {
    return this.rolesApi.getMyRoleUsingGET(orgMrn);
  }
}
