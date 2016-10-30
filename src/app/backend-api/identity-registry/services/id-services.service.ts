import {Injectable, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {ServicecontrollerApi} from "../autogen/api/ServicecontrollerApi";
import {AuthService} from "../../../authentication/services/auth.service";
import {Service} from "../autogen/model/Service";
import {PemCertificate} from "../autogen/model/PemCertificate";

@Injectable()
export class IdServicesService implements OnInit {
  private chosenService: Service;
  constructor(private servicesApi: ServicecontrollerApi, private authService: AuthService) {
  }

  ngOnInit() {

  }

  public issueNewCertificate(serviceMrn:string) : Observable<PemCertificate> {
    return Observable.create(observer => {
      let orgMrn = this.authService.authState.orgMrn;
      this.servicesApi.newServiceCertUsingGET(orgMrn, serviceMrn).subscribe(
        pemCertificate => {
          this.chosenService = null; // We need to reload now we have a new certificate
          observer.next(pemCertificate);
        },
        err => {
          observer.error(err);
        }
      );
    });
  }

  public createIdService(service:Service):Observable<Service>{
    let orgMrn = this.authService.authState.orgMrn;
    return this.servicesApi.createServiceUsingPOST(orgMrn, service);
  }
}
