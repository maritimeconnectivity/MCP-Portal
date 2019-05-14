import { Component, ViewEncapsulation } from '@angular/core';
import { Specification } from "../../../../../backend-api/service-registry/autogen/model/Specification";
import { LabelValueModel } from "../../../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";
import {
    MCNotificationsService,
    MCNotificationType
} from "../../../../../shared/mc-notifications.service";
import { ActivatedRoute, Router } from "@angular/router";
import { SpecificationsService } from "../../../../../backend-api/service-registry/services/specifications.service";
import { FileHelperService } from "../../../../../shared/file-helper.service";
import { Design } from "../../../../../backend-api/service-registry/autogen/model/Design";
import { DesignsService } from "../../../../../backend-api/service-registry/services/designs.service";
import { NavigationHelperService } from "../../../../../shared/navigation-helper.service";
import { SrViewModelService } from "../../../shared/services/sr-view-model.service";
import { AuthPermission, AuthService } from "../../../../../authentication/services/auth.service";
import { OrganizationsService } from "../../../../../backend-api/identity-registry/services/organizations.service";
import { EndorsementsService } from "../../../../../backend-api/endorsements/services/endorsements.service";
import { Observable } from "rxjs";
import { Endorsement } from "../../../../../backend-api/endorsements/autogen/model/Endorsement";
import { ServiceRegistrySearchRequest } from "../../../../shared/components/service-registry-search/ServiceRegistrySearchRequest";
import { SrSearchRequestsService } from "../../../shared/services/sr-search-requests.service";
import { SHOW_ENDORSEMENTS } from "../../../../../shared/app.constants";

const SEARCH_KEY = 'SpecificationDetailsComponent';

@Component({
  selector: 'specification-details',
  encapsulation: ViewEncapsulation.None,
  template: require('./specification-details.html'),
  styles: []
})
export class SpecificationDetailsComponent {
  public specification: Specification;
  public designs: Array<Design>;
  public title:string;
  public labelValues:Array<LabelValueModel>;
  public isLoadingSpecification: boolean;
	public isLoadingDesigns: boolean;
  public onCreate: Function;
  public onGotoDesign: Function;
	public showModal:boolean = false;
	public showModalNoDelete:boolean = false;
	public modalDescription:string;
	public modalDescriptionNoDelete:string;

	// Endorsements
	public isLoadingEndorsements:boolean;
	public isEndorsing:boolean;
	public showEndorsements:boolean;
	public isEndorsedByMyOrg:boolean;
	public endorsements:Array<Endorsement> = [];
	public endorseMainSwitch = SHOW_ENDORSEMENTS;

	// Search
	public isSearchingDesigns = false;
	public searchKey = SEARCH_KEY;
	private initialSearchRequest: ServiceRegistrySearchRequest;

  constructor(private searchRequestsService:SrSearchRequestsService, private endorsementsService:EndorsementsService, private authService: AuthService, private route: ActivatedRoute, private router: Router, private viewModelService: SrViewModelService, private navigationHelperService: NavigationHelperService, private notifications: MCNotificationsService, private specificationsService: SpecificationsService, private designsService: DesignsService, private fileHelperService: FileHelperService, private orgsService: OrganizationsService) {

  }

  ngOnInit() {
    this.onCreate = this.createDesign.bind(this);
    this.onGotoDesign = this.gotoDesign.bind(this);

    this.isLoadingSpecification = true;
    this.isLoadingDesigns = true;
    this.title = 'Loading ...';
    let specificationId = this.route.snapshot.params['id'];
    let version = this.route.snapshot.queryParams['specificationVersion'];
	  this.loadSpecification(specificationId, version);
	  if (SHOW_ENDORSEMENTS) {
			this.loadEndorsements(specificationId, version);
	  }
  }

  public downloadXml() {
    this.fileHelperService.downloadXml(this.specification.specAsXml);
  }

  public downloadDoc() {
    this.fileHelperService.downloadDoc(this.specification.specAsDoc);
  }

  private gotoDesign(index:number) {
    this.navigationHelperService.navigateToOrgDesign(this.designs[index].designId, this.designs[index].version);
  }

	private loadSpecification(specificationId:string, version:string) {
		this.specificationsService.getSpecification(specificationId, version).subscribe(
			specification => {
				this.title = specification.name;
				this.specification = specification;
				this.loadOrganizationName();
				this.loadDesigns();
			},
			err => {
				// TODO: make this as a general component
				if (err.status == 404) {
					this.router.navigate(['/error404'], {relativeTo: this.route, replaceUrl: true })
				}
				this.title = 'Error while loading';
				this.isLoadingSpecification = false;
				this.isLoadingDesigns = false;
				this.notifications.generateNotification('Error', 'Error when trying to get specification', MCNotificationType.Error, err);
			}
		);
	}

	private loadOrganizationName() {
		this.orgsService.getOrganizationName(this.specification.organizationId).subscribe(
			organizationName => {
				this.labelValues = this.viewModelService.generateLabelValuesForSpecification(this.specification, organizationName);
				this.isLoadingSpecification = false;
			},
			err => {
				this.labelValues = this.viewModelService.generateLabelValuesForSpecification(this.specification, '');
				this.isLoadingSpecification = false;
				this.notifications.generateNotification('Error', 'Error when trying to get organization', MCNotificationType.Error, err);
			}
		);
	}

  private loadDesigns() {
	  let searchRequest = this.searchRequestsService.getSearchRequest(SEARCH_KEY);
	  this.initialSearchRequest = searchRequest;
		this.searchDesigns(searchRequest);
  }

  private createDesign() {
    this.navigationHelperService.navigateToCreateDesign(this.specification.specificationId, this.specification.version);
  }

	private isMyOrg():boolean {
		return this.specification.organizationId === this.authService.authState.orgMrn;
	}

	private isServiceAdmin():boolean {
		return this.authService.authState.hasPermission(AuthPermission.ServiceAdmin);
	}

	private isServiceAdminForOrg():boolean {
		return (this.authService.authState.hasPermission(AuthPermission.ServiceAdmin) && this.isMyOrg()) || this.authService.authState.hasPermission(AuthPermission.SiteAdmin);
	}

	private isEndorseAdmin():boolean {
		return this.authService.authState.hasPermission(AuthPermission.OrgAdmin);
	}

	public showUpdate():boolean {
		return this.isServiceAdminForOrg();
	}

	public update() {
		this.navigationHelperService.navigateToUpdateSpecification(this.specification.specificationId, this.specification.version);
	}

	public shouldDisplayDelete():boolean {
		return this.isServiceAdminForOrg() && !this.isLoadingDesigns;
	}

	private hasDesigns():boolean {
		return this.designs && this.designs.length > 0;
	}

	private delete() {
  	if (this.hasDesigns()) {
		  this.modalDescriptionNoDelete = "Specification can't be deleted with active Technical Designs.<br><br>You must first delete the Technical Designs.";
		  this.showModalNoDelete = true;
	  } else {
		  this.modalDescription = 'Do you want to delete the specification?';
		  this.showModal = true;
	  }
	}
	public cancelModal() {
		this.showModal = false;
		this.showModalNoDelete = false;
	}

	public deleteForSure() {
		this.showModal = false;
		this.isLoadingSpecification = true;
		this.specificationsService.deleteSpecification(this.specification).subscribe(
			() => {
				this.deleteEndorsements();
			},
			err => {
				this.isLoadingSpecification = false;
				this.notifications.generateNotification('Error', 'Error when trying to delete specification', MCNotificationType.Error, err);
			}
		);
	}

	// Endorsement
	private deleteEndorsements() {
		if (this.endorsements && this.endorsements.length > 0) {
			this.endorsementsService.removeAllEndorsementsOfDesign(this.specification.specificationId).subscribe(
				() => {
					this.navigationHelperService.navigateToOrgSpecification('', '');
				},
				err => {
					this.notifications.generateNotification('Error', 'Error when trying to delete endorsements of specification', MCNotificationType.Error, err);
					this.navigationHelperService.navigateToOrgSpecification('', '');
				}
			);
		} else {
			this.navigationHelperService.navigateToOrgSpecification('', '');
		}
	}

	private loadEndorsements(specificationId:string, specificationVersion:string) {
		this.isLoadingEndorsements = true;
		let parallelObservables = [];

		parallelObservables.push(this.endorsementsService.isSpecificationEndorsedByMyOrg(specificationId, specificationVersion).take(1));
		parallelObservables.push(this.endorsementsService.getEndorsementsForSpecification(specificationId, specificationVersion).take(1));

		return Observable.forkJoin(parallelObservables).subscribe(
			resultArray => {
				let isEndorsedByMyOrg:any = resultArray[0];
				let pageEndorsement: any = resultArray[1];
				this.endorsements = pageEndorsement.content;
				this.isEndorsedByMyOrg = isEndorsedByMyOrg;
				this.isLoadingEndorsements = false;
				this.showEndorsements = true;
			},
			err => {
				this.showEndorsements = false;
				this.isLoadingEndorsements = false;
				this.notifications.generateNotification('Error', 'Error when trying to get endorsements for specification', MCNotificationType.Error, err);
			}
		);
	}

	public endorseToggle() {
		if (this.isEndorsedByMyOrg) {
			this.removeEndorse();
		} else {
			this.endorse();
		}
	}

	private endorse() {
		this.isEndorsing = true;
		this.endorsementsService.endorseSpecification(this.specification.specificationId, this.specification.version).subscribe(
			_ => {
				this.isEndorsedByMyOrg = true;
				this.isEndorsing = false;
				this.loadEndorsements(this.specification.specificationId, this.specification.version);
			},
			err => {
				this.isEndorsing = false;
				this.notifications.generateNotification('Error', 'Error when trying to endorse specification', MCNotificationType.Error, err);
			}
		);
	}

	private removeEndorse() {
		this.isEndorsing = true;
		this.endorsementsService.removeEndorsementOfSpecification(this.specification.specificationId, this.specification.version).subscribe(
			_ => {
				this.isEndorsedByMyOrg = false;
				this.isEndorsing = false;
				this.loadEndorsements(this.specification.specificationId, this.specification.version);
			},
			err => {
				this.isEndorsing = false;
				this.notifications.generateNotification('Error', 'Error when trying to remove endorse of specification', MCNotificationType.Error, err);
			}
		);
	}

	public shouldDisplayEndorsementButton():boolean {
		return SHOW_ENDORSEMENTS && this.isEndorseAdmin() && this.showEndorsements;
	}
	// Search
	public search(searchRequest: ServiceRegistrySearchRequest) {
		this.isSearchingDesigns = true;
		this.searchDesigns(searchRequest);
	}

	public searchDesigns(searchRequest:ServiceRegistrySearchRequest) {
		this.designsService.searchDesignsForSpecification(searchRequest, this.specification.specificationId, this.specification.version).subscribe(
			designs => {
				this.designs = designs;
				this.isLoadingDesigns = false;
				this.isSearchingDesigns = false;
				this.initialSearchRequest = searchRequest;
			},
			err => {
				this.searchRequestsService.addSearchRequest(SEARCH_KEY, this.initialSearchRequest);
				this.isLoadingDesigns = false;
				this.isSearchingDesigns = false;
				this.notifications.generateNotification('Error', 'Error when trying to search designs', MCNotificationType.Error, err);
			}
		);
	}
}
