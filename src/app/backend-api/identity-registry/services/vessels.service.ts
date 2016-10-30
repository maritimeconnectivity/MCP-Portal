import {Injectable, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {AuthService} from "../../../authentication/services/auth.service";
import {PemCertificate} from "../autogen/model/PemCertificate";
import {Vessel} from "../autogen/model/Vessel";
import {VesselcontrollerApi} from "../autogen/api/VesselcontrollerApi";

@Injectable()
export class VesselsService implements OnInit {
  private chosenVessel: Vessel;
  constructor(private vesselApi: VesselcontrollerApi, private authService: AuthService) {
  }

  ngOnInit() {

  }

  public issueNewCertificate(vesselMrn:string) : Observable<PemCertificate> {
    return Observable.create(observer => {
      let orgMrn = this.authService.authState.orgMrn;
      this.vesselApi.newVesselCertUsingGET(orgMrn, vesselMrn).subscribe(
        pemCertificate => {
          this.chosenVessel = null; // We need to reload now we have a new certificate
          observer.next(pemCertificate);
        },
        err => {
          observer.error(err);
        }
      );
    });
  }
}
