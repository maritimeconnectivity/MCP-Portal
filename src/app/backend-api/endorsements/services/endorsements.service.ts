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
import {endianness} from "os";

export interface EndorsementSearchResult {
	shouldFilter:boolean;
	pageEndorsement:PageEndorsement;
}

@Injectable()
export class EndorsementsService {
  constructor(private organizationService:OrganizationsService, private endorsementApi:EndorsecontrollerApi, private authService:AuthService) {
  }

	public isSpecificationEndorsedByMyOrg(specificationMrn:string) : Observable<boolean> {
		return this.isServiceEndorsedByMyOrg(specificationMrn);
	}

	public isDesignEndorsedByMyOrg(designMrn:string) : Observable<boolean> {
		return this.isServiceEndorsedByMyOrg(designMrn);
	}

	public isInstanceEndorsedByMyOrg(instanceMrn:string) : Observable<boolean> {
		return this.isServiceEndorsedByMyOrg(instanceMrn);
	}

  private isServiceEndorsedByMyOrg(serviceMrn:string) : Observable<boolean> {
	  return Observable.create(observer => {
		  let orgMrn = this.authService.authState.orgMrn;
		  this.endorsementApi.getEndorsmentUsingGET(serviceMrn, orgMrn).subscribe(
			  _ => {
				  observer.next(true);
			  },
			  err => {
				  if (err.status == 404) {
					  observer.next(false);
				  } else {
					  observer.error(err);
				  }
			  }
		  );
	  });
  }

	public getEndorsementsForSpecification(specificationMrn:string) : Observable<PageEndorsement> {
		return this.getEndorsements(specificationMrn);
	}

	public getEndorsementsForDesign(designMrn:string) : Observable<PageEndorsement> {
		return this.getEndorsements(designMrn);
	}

	public getEndorsementsForInstance(instanceMrn:string) : Observable<PageEndorsement> {
		return this.getEndorsements(instanceMrn);
	}

	private getEndorsements(serviceMrn:string) : Observable<PageEndorsement> {
		// TODO: Maybe some paging? remember that the methods depending on this method is expecting to get ALL endorsements. So remember paging in those methods as well. Note that some methods may need the full list so maaybe a getAll method is needed. For example when used in a search for filtering. Some methods still need the pagination, for example the list of endorsing organizations
		return this.endorsementApi.getEndormentsByServiceMrnUsingGET(serviceMrn);
	}

	public endorseSpecification(specificationMrn:string): Observable<Endorsement> {
		return this.endorseService(ServiceLevelEnum.Specification, specificationMrn);
	}

	public endorseDesign(designMrn:string, parentSpecificationMrn:string): Observable<Endorsement> {
		return this.endorseService(ServiceLevelEnum.Design, designMrn, parentSpecificationMrn);
	}

	public endorseInstance(instanceMrn:string, parentDesignMrn:string): Observable<Endorsement> {
		return this.endorseService(ServiceLevelEnum.Instance, instanceMrn, parentDesignMrn);
	}

  private endorseService(serviceLevel:ServiceLevelEnum, serviceMrn:string, parentMrn?:string): Observable<Endorsement> {
	  let orgMrn = this.authService.authState.orgMrn;
	  let userMrn = this.authService.authState.user.mrn;
  	return this.organizationService.getOrganizationName(orgMrn).flatMap(organizationName => {
		  let endorsement:Endorsement = {orgMrn:orgMrn, serviceMrn:serviceMrn, orgName:organizationName, serviceLevel:serviceLevel, userMrn:userMrn, parentMrn:parentMrn}
  		return this.endorsementApi.createEndormentUsingPOST(endorsement);
	  });
  }

	public removeAllEndorsementsOfSpecification(specificationMrn:string): Observable<any> {
		return this.removeAllEndorsementsOfService(ServiceLevelEnum.Specification, specificationMrn);
	}

	public removeAllEndorsementsOfDesign(designMrn:string): Observable<any> {
		return this.removeAllEndorsementsOfService(ServiceLevelEnum.Design, designMrn);
	}

	public removeAllEndorsementsOfInstance(instanceMrn:string): Observable<any> {
		return this.removeAllEndorsementsOfService(ServiceLevelEnum.Instance, instanceMrn);
	}

	public removeAllEndorsementsOfService(serviceLevel:ServiceLevelEnum, serviceMrn:string): Observable<any> {
		// TODO: fix when api call is there
		return Observable.create(observer => {
			observer.next('');
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
		let orgMrn = this.authService.authState.orgMrn;
		return this.endorsementApi.deleteEndormentUsingDELETE(serviceMrn, orgMrn);
	}

	public searchEndorsementsForSpecifications(searchRequest:ServiceRegistrySearchRequest) : Observable<EndorsementSearchResult> {
		return this.searchEndorsements(ServiceLevelEnum.Specification, searchRequest);
	}

	public searchEndorsementsForDesigns(searchRequest:ServiceRegistrySearchRequest, parentSpecificationMrn?:string) : Observable<EndorsementSearchResult> {
		return this.searchEndorsements(ServiceLevelEnum.Design, searchRequest, parentSpecificationMrn);
	}

	public searchEndorsementsForInstances(searchRequest:ServiceRegistrySearchRequest, parentDesignMrn?:string) : Observable<EndorsementSearchResult> {
		return this.searchEndorsements(ServiceLevelEnum.Instance, searchRequest, parentDesignMrn);
	}

	private searchEndorsements(serviceLevel:ServiceLevelEnum, searchRequest:ServiceRegistrySearchRequest, parentMrn?:string) : Observable<EndorsementSearchResult> {
		if (searchRequest && searchRequest.endorsedBy && searchRequest.endorsedBy.length > 0) {
			if (parentMrn) {
				return this.getEndormentsByOrgMrnForParent(searchRequest.endorsedBy, parentMrn);
			} else {
				return this.getEndormentsByOrgMrn(serviceLevel, searchRequest.endorsedBy);
			}
		} else {
			let endorsementResult:EndorsementSearchResult = {shouldFilter:false, pageEndorsement:null};
			return Observable.of(endorsementResult);
		}
	}

	private getEndormentsByOrgMrn(serviceLevel:ServiceLevelEnum, endorsedBy:string): Observable<EndorsementSearchResult> {
		return Observable.create(observer => {
			// TODO: Maybe some paging? remember that the methods depending on this method is expecting to get ALL endorsements. So remember paging in those methods as well. Note that some methods may need the full list so maaybe a getAll method is needed. For example when used in a search for filtering. Some methods still need the pagination, for example the list of endorsing organizations
			this.endorsementApi.getEndormentsByOrgMrnUsingGET(serviceLevel+'', endorsedBy).subscribe(
				pageEndorsement => {
					let endorsementResult:EndorsementSearchResult = {shouldFilter:true, pageEndorsement:pageEndorsement};
					observer.next(endorsementResult);
				},
				err => {
					observer.error(err);
				}
			);
		});
	}

	private getEndormentsByOrgMrnForParent(endorsedBy:string, parentMrn:string): Observable<EndorsementSearchResult> {
  	return Observable.create(observer => {
			this.endorsementApi.getEndorsedByParentMrnAndOrgMrnUsingGET(parentMrn, endorsedBy).subscribe(
				pageEndorsement => {
					// TODO: Maybe some paging? remember that the methods depending on this method is expecting to get ALL endorsements. So remember paging in those methods as well. Note that some methods may need the full list so maaybe a getAll method is needed. For example when used in a search for filtering. Some methods still need the pagination, for example the list of endorsing organizations
					let endorsementResult:EndorsementSearchResult = {shouldFilter:true, pageEndorsement:pageEndorsement};
					observer.next(endorsementResult);
				},
				err => {
					observer.error(err);
				}
			);
		});

	}
}
