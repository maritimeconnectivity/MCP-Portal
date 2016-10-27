import {Injectable, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {ServicecontrollerApi} from "../autogen/api/ServicecontrollerApi";
import {AuthService} from "../../../authentication/services/auth.service";
import {Service} from "../autogen/model/Service";

@Injectable()
export class IdServicesService implements OnInit {
  constructor(private servicesApi: ServicecontrollerApi, private authService: AuthService) {
  }

  ngOnInit() {

  }

  public createIdService(service:Service):Observable<Service>{
    let orgMrn = this.authService.authState.orgMrn;
    return this.servicesApi.createServiceUsingPOST(orgMrn, service);
  }
}
