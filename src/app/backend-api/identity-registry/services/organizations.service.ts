import {Injectable, OnInit} from '@angular/core';
import {Organization} from "../autogen/model/Organization";
import {OrganizationcontrollerApi} from "../autogen/api/OrganizationcontrollerApi";
import {Observable} from "rxjs";
import {ApiHelperService} from "../../shared/api-helper.service";
import {AuthService} from "../../../authentication/services/auth.service";

@Injectable()
export class OrganizationsService implements OnInit {
  private myOrganization: Organization;
  constructor(private apiHelper: ApiHelperService, private organizationApi: OrganizationcontrollerApi, private authService: AuthService) {
  }

  ngOnInit() {

  }

  public getMyOrganization(): Observable<Organization> {
    if (this.myOrganization) {
      return Observable.of(this.myOrganization);
    }

    let orgMrn = this.authService.authState.orgMrn;
    return Observable.create(observer => {
      this.apiHelper.prepareService(this.organizationApi, true).subscribe(res => {
        this.organizationApi.getOrganizationUsingGET(orgMrn).subscribe(
          organization => {
            this.myOrganization = organization;
            observer.next(organization);
          },
          err => {
            observer.error(err);
          }
        );
      });
    })
  }

  public getOrganization(orgMrn: string): Observable<Organization> {
    return Observable.create(observer => {
      this.apiHelper.prepareService(this.organizationApi, true).subscribe(res => {
        this.organizationApi.getOrganizationUsingGET(orgMrn).subscribe(
          organization => {
            observer.next(organization);
          },
          err => {
            observer.error(err);
          }
        );
      });
    })
  }
}
