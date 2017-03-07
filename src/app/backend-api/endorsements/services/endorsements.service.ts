import {Injectable, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {PemCertificate} from "../autogen/model/PemCertificate";
import {Device} from "../autogen/model/Device";
import {DevicecontrollerApi} from "../autogen/api/DevicecontrollerApi";
import {CertificateRevocation} from "../autogen/model/CertificateRevocation";
import {ServiceRegistrySearchRequest} from "../../../pages/shared/components/service-registry-search/ServiceRegistrySearchRequest";
import {EndorsecontrollerApi} from "../autogen/api/EndorsecontrollerApi";
import {Endorsement} from "../autogen/model/Endorsement";
import {AuthService} from "../../../authentication/services/auth.service";
import {OrganizationsService} from "../../identity-registry/services/organizations.service";

export interface EndorsementSearchResult {
	shouldFilter:boolean;
	endorsements:Array<Endorsement>;
}

enum EndorseServiceLevel {
	specification = <any> 'specification',
	design = <any> 'design',
	instance = <any> 'instance'
}

@Injectable()
export class EndorsementsService {
  constructor(private organizationService:OrganizationsService, private endorsementApi:EndorsecontrollerApi, private authService:AuthService) {
  }

	public isSpecificationEndorsedByMyOrg(specificationMrn:string) : Observable<boolean> {
		return this.isServiceEndorsedByMyOrg(EndorseServiceLevel.specification, specificationMrn);
	}

	public isDesignEndorsedByMyOrg(designMrn:string) : Observable<boolean> {
		return this.isServiceEndorsedByMyOrg(EndorseServiceLevel.design, designMrn);
	}

	public isInstanceEndorsedByMyOrg(instanceMrn:string) : Observable<boolean> {
		return this.isServiceEndorsedByMyOrg(EndorseServiceLevel.instance, instanceMrn);
	}

  private isServiceEndorsedByMyOrg(serviceLevel:EndorseServiceLevel, serviceMrn:string) : Observable<boolean> {
	  return Observable.create(observer => {
		  this.endorsementApi.getEndormentsByServiceMrnUsingGET(EndorseServiceLevel[serviceLevel], serviceMrn).subscribe(
			  endorsements => {
			  	let orgMrn = this.authService.authState.orgMrn;
			  	var endorsedByMyOrg = false;
			  	if (endorsements) {
			  		endorsements.forEach(endorsement => {
			  			if (endorsement.orgMrn === orgMrn) {
			  				endorsedByMyOrg = true;
						  }
					  });
				  }
				  observer.next(endorsedByMyOrg);
			  },
			  err => {
				  observer.error(err);
			  }
		  );
	  });
  }

	public getEndorsementsForSpecification(specificationMrn:string) : Observable<Array<Endorsement>> {
		return this.getEndorsements(EndorseServiceLevel.specification, specificationMrn);
	}

	public getEndorsementsForDesign(designMrn:string) : Observable<Array<Endorsement>> {
		return this.getEndorsements(EndorseServiceLevel.design, designMrn);
	}

	public getEndorsementsForInstance(instanceMrn:string) : Observable<Array<Endorsement>> {
		return this.getEndorsements(EndorseServiceLevel.instance, instanceMrn);
	}

	private getEndorsements(serviceLevel:EndorseServiceLevel, serviceMrn:string) : Observable<Array<Endorsement>> {
		return this.endorsementApi.getEndormentsByServiceMrnUsingGET(EndorseServiceLevel[serviceLevel], serviceMrn);
	}

	public endorseSpecification(specificationMrn:string): Observable<Endorsement> {
		return this.endorseService(EndorseServiceLevel.specification, specificationMrn);
	}

	public endorseDesign(designMrn:string): Observable<Endorsement> {
		return this.endorseService(EndorseServiceLevel.design, designMrn);
	}

	public endorseInstance(instanceMrn:string): Observable<Endorsement> {
		return this.endorseService(EndorseServiceLevel.instance, instanceMrn);
	}

  private endorseService(serviceLevel:EndorseServiceLevel, serviceMrn:string): Observable<Endorsement> {
	  let orgMrn = this.authService.authState.orgMrn;
	  let userMrn = this.authService.authState.user.mrn;
  	return this.organizationService.getOrganizationName(orgMrn).flatMap(organizationName => {
		  let endorsement:Endorsement = {orgMrn:orgMrn, serviceMrn:serviceMrn, orgName:organizationName, serviceLevel:EndorseServiceLevel[serviceLevel], userMrn:userMrn}
		  console.log("FDSAFDSAFSDAFSQF: ", endorsement);
  		return this.endorsementApi.createEndormentUsingPOST(endorsement);
	  });
  }

	public removeEndorsementOfSpecification(specificationMrn:string): Observable<any> {
		return this.removeEndorsementOfService(EndorseServiceLevel.specification, specificationMrn);
	}

	public removeEndorsementOfDesign(designMrn:string): Observable<any> {
		return this.removeEndorsementOfService(EndorseServiceLevel.design, designMrn);
	}

	public removeEndorsementOfInstance(instanceMrn:string): Observable<any> {
		return this.removeEndorsementOfService(EndorseServiceLevel.instance, instanceMrn);
	}

	private removeEndorsementOfService(serviceLevel:EndorseServiceLevel, serviceMrn:string): Observable<any> {
		return this.endorsementApi.deleteEndormentUsingDELETE(EndorseServiceLevel[serviceLevel], serviceMrn);
	}


	public searchEndorsementsForSpecifications(searchRequest:ServiceRegistrySearchRequest) : Observable<EndorsementSearchResult> {
		return this.searchEndorsements(EndorseServiceLevel.specification, searchRequest);
	}

	public searchEndorsementsForDesigns(searchRequest:ServiceRegistrySearchRequest) : Observable<EndorsementSearchResult> {
		return this.searchEndorsements(EndorseServiceLevel.design, searchRequest);
	}

	public searchEndorsementsForInstances(searchRequest:ServiceRegistrySearchRequest) : Observable<EndorsementSearchResult> {
		return this.searchEndorsements(EndorseServiceLevel.instance, searchRequest);
	}

	private searchEndorsements(serviceLevel:EndorseServiceLevel, searchRequest:ServiceRegistrySearchRequest) : Observable<EndorsementSearchResult> {
		if (searchRequest && searchRequest.endorsedBy && searchRequest.endorsedBy.length > 0) {
			return Observable.create(observer => {
				this.endorsementApi.getEndormentsByOrgMrnUsingGET(EndorseServiceLevel[serviceLevel], searchRequest.endorsedBy).subscribe(
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
