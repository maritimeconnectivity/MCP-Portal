import {Injectable} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {AuthService} from "../../../authentication/services/auth.service";
import {PemCertificate} from "../autogen/model/PemCertificate";
import {Vessel} from "../autogen/model/Vessel";
import {VesselcontrollerApi} from "../autogen/api/VesselcontrollerApi";
import {CertificateRevocation} from "../autogen/model/CertificateRevocation";

@Injectable()
export class VesselsService {
  constructor(private vesselApi: VesselcontrollerApi, private authService: AuthService) {
  }

	public getVessels(): Observable<Array<Vessel>> {
		let orgMrn = this.authService.authState.orgMrn;
		return this.vesselApi.getOrganizationVesselsUsingGET(orgMrn);
	}

	public deleteVessel(vesselMrn:string):Observable<any> {
		let orgMrn = this.authService.authState.orgMrn;
		return this.vesselApi.deleteVesselUsingDELETE(orgMrn, vesselMrn);
	}

	public getVessel(vesselMrn:string): Observable<Vessel> {
		let orgMrn = this.authService.authState.orgMrn;
		return this.vesselApi.getVesselUsingGET(orgMrn, vesselMrn);
	}

	public createVessel(vessel:Vessel) :Observable<Vessel>{
		let orgMrn = this.authService.authState.orgMrn;
		return this.vesselApi.createVesselUsingPOST(orgMrn, vessel);
	}

	public updateVessel(vessel:Vessel) :Observable<Vessel>{
		let orgMrn = this.authService.authState.orgMrn;
		return this.vesselApi.updateVesselUsingPUT(orgMrn, vessel.mrn, vessel);
	}

  public issueNewCertificate(vesselMrn:string) : Observable<PemCertificate> {
	  let orgMrn = this.authService.authState.orgMrn;
    return this.vesselApi.newVesselCertUsingGET(orgMrn, vesselMrn);
  }

	public revokeCertificate(vesselMrn:string, certificateId:number, certicateRevocation:CertificateRevocation) : Observable<any> {
		let orgMrn = this.authService.authState.orgMrn;
		return this.vesselApi.revokeVesselCertUsingPOST(orgMrn, vesselMrn, certificateId, certicateRevocation);
	}
}
