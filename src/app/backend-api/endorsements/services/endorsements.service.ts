import {Injectable, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {AuthService} from "../../../authentication/services/auth.service";
import {PemCertificate} from "../autogen/model/PemCertificate";
import {Device} from "../autogen/model/Device";
import {DevicecontrollerApi} from "../autogen/api/DevicecontrollerApi";
import {CertificateRevocation} from "../autogen/model/CertificateRevocation";
import {ServiceRegistrySearchRequest} from "../../../pages/shared/components/service-registry-search/ServiceRegistrySearchRequest";

export interface EndorsementSearchResult {
	shouldFilter:boolean;
	endorsements:Array<string>;//TODO change when model is ready
}

@Injectable()
export class EndorsementsService {
  constructor() {
  }


	public searchEndorsementsForSpecifications(searchRequest:ServiceRegistrySearchRequest) : Observable<EndorsementSearchResult> {
		if (searchRequest && searchRequest.endorsedBy && searchRequest.endorsedBy.length > 0) {
			let endorsementResult:EndorsementSearchResult = {shouldFilter:true, endorsements:['urn:mrn:mcl:service:specification:dma:nw-nm', 'urn:mrn:stm:service:specification:viktoria:message_broker']};
			return Observable.of(endorsementResult);
		} else {
			let endorsementResult:EndorsementSearchResult = {shouldFilter:false, endorsements:[]};
			return Observable.of(endorsementResult);
		}
	}
}
