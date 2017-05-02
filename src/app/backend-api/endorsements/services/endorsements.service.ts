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

	public isSpecificationEndorsedByMyOrg(specificationMrn:string, specificationVersion:string) : Observable<boolean> {
		return this.isServiceEndorsedByMyOrg(specificationMrn, specificationVersion);
	}

	public isDesignEndorsedByMyOrg(designMrn:string, designVersion:string) : Observable<boolean> {
		return this.isServiceEndorsedByMyOrg(designMrn, designVersion);
	}

	public isInstanceEndorsedByMyOrg(instanceMrn:string, instanceVersion:string) : Observable<boolean> {
		return this.isServiceEndorsedByMyOrg(instanceMrn, instanceVersion);
	}

  private isServiceEndorsedByMyOrg(serviceMrn:string, serviceVersion:string) : Observable<boolean> {
	  return Observable.create(observer => {
		  let orgMrn = this.authService.authState.orgMrn;
		  this.endorsementApi.getEndorsmentUsingGET(serviceMrn, serviceVersion, orgMrn).subscribe(
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

	public getEndorsementsForSpecification(specificationMrn:string, specificationVersion:string) : Observable<PageEndorsement> {
		return this.getEndorsements(specificationMrn, specificationVersion);
	}

	public getEndorsementsForDesign(designMrn:string, designVersion:string) : Observable<PageEndorsement> {
		return this.getEndorsements(designMrn, designVersion);
	}

	public getEndorsementsForInstance(instanceMrn:string, instanceVersion:string) : Observable<PageEndorsement> {
		return this.getEndorsements(instanceMrn, instanceVersion);
	}

	private getEndorsements(serviceMrn:string, serviceVersion:string) : Observable<PageEndorsement> {
		// TODO: Maybe some paging? remember that the methods depending on this method is expecting to get ALL endorsements. So remember paging in those methods as well. Note that some methods may need the full list so maaybe a getAll method is needed. For example when used in a search for filtering. Some methods still need the pagination, for example the list of endorsing organizations
		return this.endorsementApi.getEndormentsByServiceMrnUsingGET(serviceMrn, serviceVersion);
	}

	public endorseSpecification(specificationMrn:string, specificationVersion:string): Observable<Endorsement> {
		return this.endorseService(ServiceLevelEnum.Specification, specificationMrn, specificationVersion);
	}

	public endorseDesign(designMrn:string, designVersion:string, parentSpecificationMrn:string, parentSpecificationVersion:string): Observable<Endorsement> {
		return this.endorseService(ServiceLevelEnum.Design, designMrn, designVersion, parentSpecificationMrn, parentSpecificationVersion);
	}

	public endorseInstance(instanceMrn:string, instanceVersion:string, parentDesignMrn:string, parentDesignVersion:string): Observable<Endorsement> {
		return this.endorseService(ServiceLevelEnum.Instance, instanceMrn, instanceVersion, parentDesignMrn, parentDesignVersion);
	}

  private endorseService(serviceLevel:ServiceLevelEnum, serviceMrn:string, serviceVersion:string, parentMrn?:string, parentVersion?:string): Observable<Endorsement> {
	  let orgMrn = this.authService.authState.orgMrn;
	  let userMrn = this.authService.authState.user.mrn;
  	return this.organizationService.getOrganizationName(orgMrn).flatMap(organizationName => {
		  let endorsement:Endorsement = {orgMrn:orgMrn, serviceMrn:serviceMrn, serviceVersion:serviceVersion, orgName:organizationName, serviceLevel:serviceLevel, userMrn:userMrn, parentMrn:parentMrn, parentVersion:parentVersion}
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

	public removeEndorsementOfSpecification(specificationMrn:string, specificationVersion:string): Observable<any> {
		return this.removeEndorsementOfService(ServiceLevelEnum.Specification, specificationMrn, specificationVersion);
	}

	public removeEndorsementOfDesign(designMrn:string, designVersion:string): Observable<any> {
		return this.removeEndorsementOfService(ServiceLevelEnum.Design, designMrn, designVersion);
	}

	public removeEndorsementOfInstance(instanceMrn:string, instanceVersion:string): Observable<any> {
		return this.removeEndorsementOfService(ServiceLevelEnum.Instance, instanceMrn, instanceVersion);
	}

	private removeEndorsementOfService(serviceLevel:ServiceLevelEnum, serviceMrn:string, serviceVersion:string): Observable<any> {
		let orgMrn = this.authService.authState.orgMrn;
		return this.endorsementApi.deleteEndormentUsingDELETE(serviceMrn, serviceVersion, orgMrn);
	}

	public searchEndorsementsForSpecifications(searchRequest:ServiceRegistrySearchRequest) : Observable<EndorsementSearchResult> {
		return this.searchEndorsements(ServiceLevelEnum.Specification, searchRequest);
	}

	public searchEndorsementsForDesigns(searchRequest:ServiceRegistrySearchRequest, parentSpecificationMrn?:string, parentVersion?:string) : Observable<EndorsementSearchResult> {
		return this.searchEndorsements(ServiceLevelEnum.Design, searchRequest, parentSpecificationMrn, parentVersion);
	}

	public searchEndorsementsForInstances(searchRequest:ServiceRegistrySearchRequest, parentDesignMrn?:string, parentVersion?:string) : Observable<EndorsementSearchResult> {
		return this.searchEndorsements(ServiceLevelEnum.Instance, searchRequest, parentDesignMrn, parentVersion);
	}

	private searchEndorsements(serviceLevel:ServiceLevelEnum, searchRequest:ServiceRegistrySearchRequest, parentMrn?:string, parentVersion?:string) : Observable<EndorsementSearchResult> {
		if (searchRequest && searchRequest.endorsedBy && searchRequest.endorsedBy.length > 0) {
			if (parentMrn) {
				return this.getEndormentsByOrgMrnForParent(searchRequest.endorsedBy, parentMrn, parentVersion);
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

	private getEndormentsByOrgMrnForParent(endorsedBy:string, parentMrn:string, parentVersion:string): Observable<EndorsementSearchResult> {
  	return Observable.create(observer => { // TODO parentVersion
			this.endorsementApi.getEndorsedByParentMrnAndOrgMrnUsingGET(parentMrn, parentVersion, endorsedBy).subscribe(
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
