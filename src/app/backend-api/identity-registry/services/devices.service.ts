import {Injectable, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {AuthService} from "../../../authentication/services/auth.service";
import {PemCertificate} from "../autogen/model/PemCertificate";
import {Device} from "../autogen/model/Device";
import {DevicecontrollerApi} from "../autogen/api/DevicecontrollerApi";

@Injectable()
export class DevicesService implements OnInit {
  private chosenDevice: Device;
  constructor(private deviceApi: DevicecontrollerApi, private authService: AuthService) {
  }

  ngOnInit() {

  }

  public issueNewCertificate(deviceMrn:string) : Observable<PemCertificate> {
    return Observable.create(observer => {
      let orgMrn = this.authService.authState.orgMrn;
      this.deviceApi.newDeviceCertUsingGET(orgMrn, deviceMrn).subscribe(
        pemCertificate => {
          this.chosenDevice = null; // We need to reload now we have a new certificate
          observer.next(pemCertificate);
        },
        err => {
          observer.error(err);
        }
      );
    });
  }
}
