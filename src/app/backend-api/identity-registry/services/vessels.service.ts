import {Injectable} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {AuthService} from "../../../authentication/services/auth.service";
import {PemCertificate} from "../autogen/model/PemCertificate";
import {Vessel} from "../autogen/model/Vessel";
import {VesselcontrollerApi} from "../autogen/api/VesselcontrollerApi";
import {CertificateRevocation} from "../autogen/model/CertificateRevocation";
import {PageVessel} from "../autogen/model/PageVessel";
import {SortingHelper} from "../../shared/SortingHelper";

@Injectable()
export class VesselsService {
  constructor(private vesselApi: VesselcontrollerApi, private authService: AuthService) {
  }

	public getVessels(): Observable<PageVessel> {
		let orgMrn = this.authService.authState.orgMrn;
		let sort = SortingHelper.sortingForVessels();
		// TODO: do paging properly
		return this.vesselApi.getOrganizationVesselsUsingGET(orgMrn, 0,300, sort);
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

	public revokeCertificate(vesselMrn:string, certificateId:string, certicateRevocation:CertificateRevocation) : Observable<any> {
		let orgMrn = this.authService.authState.orgMrn;
		return this.vesselApi.revokeVesselCertUsingPOST(orgMrn, vesselMrn, certificateId, certicateRevocation);
	}

	public getVesselServices(vesselMrn:string) : Observable<any> {
  		let orgMrn = this.authService.authState.orgMrn;
  		return this.vesselApi.getVesselServicesUsingGET(orgMrn, vesselMrn);
	}
}
