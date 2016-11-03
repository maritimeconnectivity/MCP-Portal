import {Injectable} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {AuthService} from "../../../authentication/services/auth.service";
import {PemCertificate} from "../autogen/model/PemCertificate";
import {Vessel} from "../autogen/model/Vessel";
import {VesselcontrollerApi} from "../autogen/api/VesselcontrollerApi";

@Injectable()
export class VesselsService {
  private chosenVessel: Vessel;
  constructor(private vesselApi: VesselcontrollerApi, private authService: AuthService) {
  }

	public getVessels(): Observable<Array<Vessel>> {
		let orgMrn = this.authService.authState.orgMrn;
		return this.vesselApi.getOrganizationVesselsUsingGET(orgMrn);
	}

	public getVessel(vesselMrn:string): Observable<Vessel> {
		if (this.chosenVessel && this.chosenVessel.mrn === vesselMrn) {
			return Observable.of(this.chosenVessel);
		}

		return Observable.create(observer => {
			let orgMrn = this.authService.authState.orgMrn;
			this.vesselApi.getVesselUsingGET(orgMrn, vesselMrn).subscribe(
				vessel => {
					this.chosenVessel = vessel;
					observer.next(vessel);
				},
				err => {
					observer.error(err);
				}
			);
		});
	}

	public createVessel(vessel:Vessel) :Observable<Vessel>{
		return Observable.create(observer => {
			let orgMrn = this.authService.authState.orgMrn;

			this.vesselApi.createVesselUsingPOST(orgMrn, vessel).subscribe(
				vessel => {
					this.chosenVessel = vessel;
					observer.next(vessel);
				},
				err => {
					observer.error(err);
				}
			);
		});
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
