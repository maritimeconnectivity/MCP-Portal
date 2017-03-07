import {Injectable, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {PemCertificate} from "../autogen/model/PemCertificate";
import {Device} from "../autogen/model/Device";
import {DevicecontrollerApi} from "../autogen/api/DevicecontrollerApi";
import {CertificateRevocation} from "../autogen/model/CertificateRevocation";
import {ServiceRegistrySearchRequest} from "../../../pages/shared/components/service-registry-search/ServiceRegistrySearchRequest";
import {EndorsecontrollerApi} from "../autogen/api/EndorsecontrollerApi";
import {Endorsement} from "../autogen/model/Endorsement";

export interface EndorsementSearchResult {
	shouldFilter:boolean;
	endorsements:Array<Endorsement>;
}

@Injectable()
export class EndorsementsService {
  constructor(private endorsementApi:EndorsecontrollerApi) {
  }


	public searchEndorsementsForSpecifications(searchRequest:ServiceRegistrySearchRequest) : Observable<EndorsementSearchResult> {
		return this.searchEndorsements('specification', searchRequest);
	}

	public searchEndorsementsForDesigns(searchRequest:ServiceRegistrySearchRequest) : Observable<EndorsementSearchResult> {
		return this.searchEndorsements('design', searchRequest);
	}

	public searchEndorsementsForInstances(searchRequest:ServiceRegistrySearchRequest) : Observable<EndorsementSearchResult> {
		return this.searchEndorsements('instance', searchRequest);
	}

	private searchEndorsements(serviceLevel:string, searchRequest:ServiceRegistrySearchRequest) : Observable<EndorsementSearchResult> {
		if (searchRequest && searchRequest.endorsedBy && searchRequest.endorsedBy.length > 0) {
			return Observable.create(observer => {
				this.endorsementApi.getEndormentsByOrgMrnUsingGET(serviceLevel, searchRequest.endorsedBy).subscribe(
					endorsements => {
						let endorsementResult:EndorsementSearchResult = {shouldFilter:true, endorsements:endorsements};
						observer.next(endorsementResult);
					},
					err => {
						observer.error(err);
					}
				);
			});
		} else {
			let endorsementResult:EndorsementSearchResult = {shouldFilter:false, endorsements:[]};
			return Observable.of(endorsementResult);
		}
	}
}
