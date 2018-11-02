import {Injectable, OnInit} from '@angular/core';
import {Organization} from "../autogen/model/Organization";
import {OrganizationcontrollerApi} from "../autogen/api/OrganizationcontrollerApi";
import {Observable} from "rxjs";
import {AuthService} from "../../../authentication/services/auth.service";
import {PemCertificate} from "../autogen/model/PemCertificate";
import {CertificateRevocation} from "../autogen/model/CertificateRevocation";
import {SortingHelper} from "../../shared/SortingHelper";
import {PAGE_SIZE_DEFAULT} from "../../../shared/app.constants";

@Injectable()
export class OrganizationsService implements OnInit {
	private myOrganization: Organization;
	private organizations: Array<Organization>;
	private unapprovedOrganizations: Array<Organization>;
  constructor(private organizationApi: OrganizationcontrollerApi, private authService: AuthService) {
  }

  ngOnInit() {

  }

	public approveOrganization(orgMrn:string):Observable<Organization> {
  	this.organizations = null;
		return this.organizationApi.approveOrganizationUsingGET(orgMrn);
	}

	public deleteOrganization(orgMrn:string):Observable<any> {
		// TODO: for now this organization is crucial to the Maritime Connectivity Platform, and cannot be deleted. Also you cant delete you own
		if (orgMrn === 'urn:mrn:mcl:org:dma') {
			throw Error('You cannot delete this organization');
		}
		if (this.authService.isMyOrg(orgMrn)) {
			throw Error('You cannot delete your own organization');
		}
		this.organizations = null;
		return this.organizationApi.deleteOrgUsingDELETE(orgMrn);
	}

	public getUnapprovedOrganization(orgMrn:string) : Observable<Organization> {
		var foundOrganization:Organization;
		if (this.unapprovedOrganizations) {
			this.unapprovedOrganizations.forEach(organization => {
				if (organization.mrn === orgMrn) {
					foundOrganization = organization;
				}
			});
		}
		if (foundOrganization) {
			return Observable.of(foundOrganization);
		}
		// Should never come to this
		return Observable.create(observer => {
			// TODO: do paging properly
			this.organizationApi.getUnapprovedOrganizationsUsingGET(0,PAGE_SIZE_DEFAULT).subscribe(
				pageOrganization => {
					this.unapprovedOrganizations = pageOrganization.content;
					var foundOrganization = null;
					this.unapprovedOrganizations.forEach(organization => {
						if (organization.mrn === orgMrn) {
							foundOrganization = organization;
						}
					});
					if (foundOrganization) {
						observer.next(foundOrganization);
					} else {
						observer.error(new Error("Unknown error occured"));
					}
				},
				err => {
					observer.error(err);
				}
			);
		});
	}

	public getUnapprovedOrganizations () : Observable<Array<Organization>> {
		return Observable.create(observer => {
			// TODO: do paging properly
			this.organizationApi.getUnapprovedOrganizationsUsingGET(0,PAGE_SIZE_DEFAULT).subscribe(
				pageOrganization => {
					this.unapprovedOrganizations = pageOrganization.content;
					observer.next(pageOrganization.content);
				},
				err => {
					observer.error(err);
				}
			);
		});
	}

  public applyOrganization(organization:Organization): Observable<Organization>{
	  return this.organizationApi.applyOrganizationUsingPOST(organization);
  }

	public updateOrganization(organization:Organization) : Observable<PemCertificate> {
		return Observable.create(observer => {
			this.organizationApi.updateOrganizationUsingPUT(organization.mrn, organization).subscribe(
				_ => {
					this.myOrganization = null; // We need to reload my org in case it's my org that was updated
					this.organizations = null; // Also need to get fresh organization list
					observer.next(_);
				},
				err => {
					observer.error(err);
				}
			);
		});
	}

	public issueNewCertificate() : Observable<PemCertificate> {
		return Observable.create(observer => {
			let orgMrn = this.authService.authState.orgMrn;
			this.organizationApi.newOrgCertUsingGET(orgMrn).subscribe(
				pemCertificate => {
					this.myOrganization = null; // We need to reload the org now we have a new certificate
					observer.next(pemCertificate);
				},
				err => {
					observer.error(err);
				}
			);
		});
	}

	public revokeCertificate(certificateId:string, certicateRevocation:CertificateRevocation) : Observable<any> {
		return Observable.create(observer => {
			let orgMrn = this.authService.authState.orgMrn;
			this.organizationApi.revokeOrgCertUsingPOST(orgMrn, certificateId, certicateRevocation).subscribe(
				res => {
					this.myOrganization = null; // We need to reload the org now we have a new certificate
					observer.next(res);
				},
				err => {
					observer.error(err);
				}
			);
		});
	}

  // TODO: explore the possibilities with returning cached responses. Currently there is 2 calls to myOrg before result is ready. I'm sure there is something in Observable to fix this
  public getMyOrganization(): Observable<Organization> {
    if (this.myOrganization) {
      return Observable.of(this.myOrganization);
    }

    // We create a new observable because we need to save the response for simple caching
    let orgMrn = this.authService.authState.orgMrn;
    return Observable.create(observer => {
      this.organizationApi.getOrganizationUsingGET(orgMrn).subscribe(
        organization => {
          this.myOrganization = organization;
          observer.next(organization);
        },
        err => {
          observer.error(err);
        }
      );
    });
  }

  public getOrganization(orgMrn: string): Observable<Organization> {
    return this.organizationApi.getOrganizationUsingGET(orgMrn);
  }

  public getOrganizationById(orgId: number): Observable<Organization> {
  	return this.organizationApi.getOrganizationByIdUsingGET(orgId);
  }

	public getAllOrganizations () : Observable<Array<Organization>> {
		if (this.organizations) {
			return Observable.of(this.organizations);
		}

		return Observable.create(observer => {
			let sort = SortingHelper.sortingForOrganizations();
			// TODO: do paging properly
			this.organizationApi.getOrganizationUsingGET2(0,PAGE_SIZE_DEFAULT, sort).subscribe(
				pageOrganization => {
					this.organizations = pageOrganization.content;
					observer.next(pageOrganization.content);
				},
				err => {
					observer.error(err);
				}
			);
		});
	}
// TODO: explore the possibilities with returning cached responses. Currently there is many calls to this function before result is ready when the organizations has been reset. I'm sure there is something in Observable to fix this
	public getOrganizationName(orgMrn:string) : Observable<string> {
		if (this.organizations) {
			return Observable.of(this.searchOrganizationNameFromList(orgMrn));
		}

		return Observable.create(observer => {
			// TODO: This should always get all organizations. So make pagesize unlimited. OR maybe build in fetch of next page if searchOrganizationNameFromList returns nothing
			this.organizationApi.getOrganizationUsingGET2(0,PAGE_SIZE_DEFAULT).subscribe(
				pageOrganization => {
					this.organizations = pageOrganization.content;
					observer.next(this.searchOrganizationNameFromList(orgMrn));
				},
				err => {
					observer.error(err);
				}
			);
		});
	}
	private searchOrganizationNameFromList(orgMrn:string) : string {
		if (this.organizations) {
			for(let organization of this.organizations) {
				if (organization.mrn === orgMrn) {
					return organization.name;
				}
			}
		}
		return '';
	}
}
