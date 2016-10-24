import {Injectable, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {ApiHelperService} from "../../shared/api-helper.service";
import {RolecontrollerApi} from "../autogen/api/RolecontrollerApi";

@Injectable()
export class RolesService implements OnInit {
  constructor(private apiHelper: ApiHelperService, private rolesApi: RolecontrollerApi) {
  }

  ngOnInit() {
  }

  public getMyRoles(orgMrn:string): Observable<Array<string>> {
    return Observable.create(observer => {
      this.apiHelper.prepareService(this.rolesApi, true).subscribe(res => {
        this.rolesApi.getMyRoleUsingGET(orgMrn).subscribe(
          roles => {
            observer.next(roles);
          },
          err => {
            observer.error(err);
          }
        );
      });
    });
  }
}
