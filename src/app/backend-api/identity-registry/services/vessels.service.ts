import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { AuthService } from "../../../authentication/services/auth.service";
import { Vessel } from "../autogen/model/Vessel";
import { VesselcontrollerApi } from "../autogen/api/VesselcontrollerApi";
import { CertificateRevocation } from "../autogen/model/CertificateRevocation";
import { PageVessel } from "../autogen/model/PageVessel";
import { SortingHelper } from "../../shared/SortingHelper";
import { PAGE_SIZE_DEFAULT } from "../../../shared/app.constants";
import { CertificateBundle } from '../autogen/model/CertificateBundle';

@Injectable()
export class VesselsService {
	private vesselsCache: PageVessel;
  constructor(private vesselApi: VesselcontrollerApi, private authService: AuthService) {
  }

	public getVessels(): Observable<PageVessel> {
  	if (this.vesselsCache && !this.authService.authState.acting){
		  return Observable.of(this.vesselsCache);
	  }

		return Observable.create(observer => {
			let orgMrn = this.authService.authState.orgMrn;
			let sort = SortingHelper.sortingForVessels();
			// TODO: do paging properly
			this.vesselApi.getOrganizationVesselsUsingGET(orgMrn, 0,PAGE_SIZE_DEFAULT, sort).subscribe(
				pageVessel => {
					if (!this.authService.authState.acting) {
                        this.vesselsCache = pageVessel;
                    }
					observer.next(pageVessel);
				},
				err => {
					observer.error(err);
				}
			);
		});
	}

	public deleteVessel(vesselMrn:string):Observable<any> {
		let orgMrn = this.authService.authState.orgMrn;
		return this.vesselApi.deleteVesselUsingDELETE(orgMrn, vesselMrn);
	}

	public getVessel(vesselMrn:string): Observable<Vessel> {
  	this.vesselsCache = null;
		let orgMrn = this.authService.authState.orgMrn;
		return this.vesselApi.getVesselUsingGET(orgMrn, vesselMrn);
	}

	public createVessel(vessel:Vessel): Observable<Vessel> {
		this.vesselsCache = null;
		let orgMrn = this.authService.authState.orgMrn;
		return this.vesselApi.createVesselUsingPOST(orgMrn, vessel);
	}

	public updateVessel(vessel:Vessel): Observable<Vessel> {
		this.vesselsCache = null;
		let orgMrn = this.authService.authState.orgMrn;
		return this.vesselApi.updateVesselUsingPUT(orgMrn, vessel.mrn, vessel);
	}

  public issueNewCertificate(csr: string, vesselMrn:string, useServerGeneratedKeys: boolean): Observable<string | CertificateBundle> {
	  this.vesselsCache = null;
	  let orgMrn = this.authService.authState.orgMrn;
	  if (useServerGeneratedKeys) {
	  	return this.vesselApi.newVesselCertUsingGET(orgMrn, vesselMrn);
	  }
	  return this.vesselApi.newVesselCertFromCsrUsingPOST(csr, orgMrn, vesselMrn);
  }

	public revokeCertificate(vesselMrn:string, certificateId:string, certificateRevocation:CertificateRevocation) : Observable<any> {
		this.vesselsCache = null;
		let orgMrn = this.authService.authState.orgMrn;
		return this.vesselApi.revokeVesselCertUsingPOST(orgMrn, vesselMrn, certificateId, certificateRevocation);
	}

	public getVesselServices(vesselMrn:string): Observable<any> {
  		let orgMrn = this.authService.authState.orgMrn;
  		return this.vesselApi.getVesselServicesUsingGET(orgMrn, vesselMrn);
	}
}
