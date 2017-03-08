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
import ServiceLevelEnum = Endorsement.ServiceLevelEnum;
import {PageEndorsement} from "../autogen/model/PageEndorsement";

export interface EndorsementSearchResult {
	shouldFilter:boolean;
	pageEndorsement:PageEndorsement;
}

@Injectable()
export class EndorsementsService {
  constructor(private organizationService:OrganizationsService, private endorsementApi:EndorsecontrollerApi, private authService:AuthService) {
  }

	public isSpecificationEndorsedByMyOrg(specificationMrn:string) : Observable<boolean> {
		return this.isServiceEndorsedByMyOrg(ServiceLevelEnum.Specification, specificationMrn);
	}

	public isDesignEndorsedByMyOrg(designMrn:string) : Observable<boolean> {
		return this.isServiceEndorsedByMyOrg(ServiceLevelEnum.Design, designMrn);
	}

	public isInstanceEndorsedByMyOrg(instanceMrn:string) : Observable<boolean> {
		return this.isServiceEndorsedByMyOrg(ServiceLevelEnum.Instance, instanceMrn);
	}

  private isServiceEndorsedByMyOrg(serviceLevel:ServiceLevelEnum, serviceMrn:string) : Observable<boolean> {
	  return Observable.create(observer => {
		  this.endorsementApi.getEndormentsByServiceMrnUsingGET(serviceLevel+'', serviceMrn).subscribe(
			  pageEndorsement => {
			  	let orgMrn = this.authService.authState.orgMrn;
			  	var endorsedByMyOrg = false;
			  	if (pageEndorsement) {
					  pageEndorsement.content.forEach(endorsement => {
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

	public getEndorsementsForSpecification(specificationMrn:string) : Observable<PageEndorsement> {
		return this.getEndorsements(ServiceLevelEnum.Specification, specificationMrn);
	}

	public getEndorsementsForDesign(designMrn:string) : Observable<PageEndorsement> {
		return this.getEndorsements(ServiceLevelEnum.Design, designMrn);
	}

	public getEndorsementsForInstance(instanceMrn:string) : Observable<PageEndorsement> {
		return this.getEndorsements(ServiceLevelEnum.Instance, instanceMrn);
	}

	private getEndorsements(serviceLevel:ServiceLevelEnum, serviceMrn:string) : Observable<PageEndorsement> {
		return this.endorsementApi.getEndormentsByServiceMrnUsingGET(serviceLevel+'', serviceMrn);
	}

	public endorseSpecification(specificationMrn:string): Observable<Endorsement> {
		return this.endorseService(ServiceLevelEnum.Specification, specificationMrn);
	}

	public endorseDesign(designMrn:string): Observable<Endorsement> {
		return this.endorseService(ServiceLevelEnum.Design, designMrn);
	}

	public endorseInstance(instanceMrn:string): Observable<Endorsement> {
		return this.endorseService(ServiceLevelEnum.Instance, instanceMrn);
	}

  private endorseService(serviceLevel:ServiceLevelEnum, serviceMrn:string): Observable<Endorsement> {
	  let orgMrn = this.authService.authState.orgMrn;
	  let userMrn = this.authService.authState.user.mrn;
  	return this.organizationService.getOrganizationName(orgMrn).flatMap(organizationName => {
		  let endorsement:Endorsement = {orgMrn:orgMrn, serviceMrn:serviceMrn, orgName:organizationName, serviceLevel:serviceLevel, userMrn:userMrn}
  		return this.endorsementApi.createEndormentUsingPOST(endorsement);
	  });
  }

	public removeEndorsementOfSpecification(specificationMrn:string): Observable<any> {
		return this.removeEndorsementOfService(ServiceLevelEnum.Specification, specificationMrn);
	}

	public removeEndorsementOfDesign(designMrn:string): Observable<any> {
		return this.removeEndorsementOfService(ServiceLevelEnum.Design, designMrn);
	}

	public removeEndorsementOfInstance(instanceMrn:string): Observable<any> {
		return this.removeEndorsementOfService(ServiceLevelEnum.Instance, instanceMrn);
	}

	private removeEndorsementOfService(serviceLevel:ServiceLevelEnum, serviceMrn:string): Observable<any> {
		return this.endorsementApi.deleteEndormentUsingDELETE(serviceLevel+'', serviceMrn);
	}

	public searchEndorsementsForSpecifications(searchRequest:ServiceRegistrySearchRequest) : Observable<EndorsementSearchResult> {
		return this.searchEndorsements(ServiceLevelEnum.Specification, searchRequest);
	}

	public searchEndorsementsForDesigns(searchRequest:ServiceRegistrySearchRequest) : Observable<EndorsementSearchResult> {
		return this.searchEndorsements(ServiceLevelEnum.Design, searchRequest);
	}

	public searchEndorsementsForInstances(searchRequest:ServiceRegistrySearchRequest) : Observable<EndorsementSearchResult> {
		return this.searchEndorsements(ServiceLevelEnum.Instance, searchRequest);
	}

	private searchEndorsements(serviceLevel:ServiceLevelEnum, searchRequest:ServiceRegistrySearchRequest) : Observable<EndorsementSearchResult> {
		if (searchRequest && searchRequest.endorsedBy && searchRequest.endorsedBy.length > 0) {
			return Observable.create(observer => {
				this.endorsementApi.getEndormentsByOrgMrnUsingGET(serviceLevel+'', searchRequest.endorsedBy).subscribe(
					pageEndorsement => {
						let endorsementResult:EndorsementSearchResult = {shouldFilter:true, pageEndorsement:pageEndorsement};
						observer.next(endorsementResult);
					},
					err => {
						observer.error(err);
					}
				);
			});
		} else {
			let endorsementResult:EndorsementSearchResult = {shouldFilter:false, pageEndorsement:null};
			return Observable.of(endorsementResult);
		}
	}
}
