import {Injectable, OnInit} from '@angular/core';
import {Organization} from "../autogen/model/Organization";
import {OrganizationcontrollerApi} from "../autogen/api/OrganizationcontrollerApi";
import {Observable} from "rxjs";
import {ApiHelperService} from "../../shared/api-helper.service";
import {AuthService} from "../../../authentication/services/auth.service";

@Injectable()
export class OrganizationService implements OnInit {
  constructor(private apiHelper: ApiHelperService, private organizationApi: OrganizationcontrollerApi, private authService: AuthService) {
  }

  ngOnInit() {

  }

  public getMyOrganization(): Observable<Organization> {
    let shortName = this.authService.authState.orgShortName;
    return this.getOrganization(shortName);
  }

  public getOrganization(shortName: string): Observable<Organization> {
    return Observable.create(observer => {
      this.apiHelper.prepareService(this.organizationApi, true).subscribe(res => {
        this.organizationApi.getOrganizationUsingGET(shortName).subscribe(
          organization => {
            observer.next(organization);
          },
          err => {
            observer.error(err);
          }
        );
      });
    });
  }
}
