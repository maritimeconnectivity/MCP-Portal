import {Injectable, OnInit} from '@angular/core';
import {Organization} from "../autogen/model/Organization";
import {OrganizationcontrollerApi} from "../autogen/api/OrganizationcontrollerApi";
import {Observable} from "rxjs";
import {ApiHelperService} from "../../shared/api-helper.service";
import {AuthService} from "../../../authentication/services/auth.service";
import {ServicespecificationresourceApi} from "../autogen/api/ServicespecificationresourceApi";
import {Specification} from "../autogen/model/Specification";

@Injectable()
export class SpecificationsService implements OnInit {
  constructor(private apiHelper: ApiHelperService, private specificationsApi: ServicespecificationresourceApi, private authService: AuthService) {
  }

  ngOnInit() {

  }

  public getSpecificationsForMyOrg(): Observable<Array<Specification>> {
    let shortName = this.authService.authState.orgShortName;
    return Observable.create(observer => {
      this.apiHelper.prepareService(this.specificationsApi, true).subscribe(res => {
        // TODO for now just get all specifications. Needs to be for this org only though
        this.specificationsApi.getAllSpecificationsUsingGET().subscribe(
          specifications => {
            observer.next(specifications);
          },
          err => {
            observer.error(err);
          }
        );
      });
    })
  }
}
