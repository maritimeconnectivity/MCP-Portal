import {Injectable, OnInit} from '@angular/core';
import {Organization} from "../autogen/model/Organization";
import {OrganizationcontrollerApi} from "../autogen/api/OrganizationcontrollerApi";
import {Observable} from "rxjs";
import {AuthService} from "../../../authentication/services/auth.service";
import {PemCertificate} from "../autogen/model/PemCertificate";

@Injectable()
export class OrganizationsService implements OnInit {
	private myOrganization: Organization;
	private unapprovedOrganizations: Array<Organization>;
  constructor(private organizationApi: OrganizationcontrollerApi, private authService: AuthService) {
  }

  ngOnInit() {

  }

	public approveOrganization(orgMrn:string):Observable<Organization> {
		return this.organizationApi.approveOrganizationUsingGET(orgMrn);
	}

	public deleteOrganization(orgMrn:string):Observable<any> {
		// TODO: for now this organization is crucial to the Maritime Cloud, and cannot be deleted. Also you cant delete you own
		if (orgMrn === 'urn:mrn:mcl:org:dma') {
			throw Error('You cannot delete this organization');
		}
		if (this.authService.isMyOrg(orgMrn)) {
			throw Error('You cannot delete your own organization');
		}
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
			this.organizationApi.getUnapprovedOrganizationsUsingGET().subscribe(
				organizations => {
					this.unapprovedOrganizations = organizations;
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
			this.organizationApi.getUnapprovedOrganizationsUsingGET().subscribe(
				organizations => {
					this.unapprovedOrganizations = organizations;
					observer.next(organizations);
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

  // TODO: explore the possibilities with returning cahced responses. Currently there is 2 calls to myOrg before result is ready. I'm sure there is something in Observable to fix this
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

	public getAllOrganizations () : Observable<Array<Organization>> {
		return this.organizationApi.getOrganizationUsingGET2();
	}
}
