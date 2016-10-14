import {Injectable, OnInit} from '@angular/core';
import {Organization} from "../autogen/model/Organization";
import {OrganizationcontrollerApi} from "../autogen/api/OrganizationcontrollerApi";
import {Observable} from "rxjs";
import {ApiHelperService} from "../../shared/api-helper.service";

@Injectable()
export class OrganizationService implements OnInit {
  constructor(private apiHelper: ApiHelperService, private organizationApi: OrganizationcontrollerApi) {
  }

  ngOnInit() {

  }
  public getOrganization(shortName: string): Observable<Organization> {
    return Observable.create(observer => {
      this.apiHelper.prepareService(this.organizationApi).subscribe(res => {
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
  /*
  public getAllSpecifications() : Array<Specification> {
  //  this.serviceSpecApi.defaultHeaders.set('Authorization', 'Bearer ' + token);
    return this.allSpecifications;
  }
  */
}
