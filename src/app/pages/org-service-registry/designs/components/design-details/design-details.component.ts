import { Component, ViewEncapsulation } from '@angular/core';
import {LabelValueModel} from "../../../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";
import {ActivatedRoute, Router} from "@angular/router";
import {FileHelperService} from "../../../../../shared/file-helper.service";
import {Design} from "../../../../../backend-api/service-registry/autogen/model/Design";
import {DesignsService} from "../../../../../backend-api/service-registry/services/designs.service";
import {NavigationHelperService} from "../../../../../shared/navigation-helper.service";
import {SpecificationsService} from "../../../../../backend-api/service-registry/services/specifications.service";
import {Instance} from "../../../../../backend-api/service-registry/autogen/model/Instance";
import {InstancesService} from "../../../../../backend-api/service-registry/services/instances.service";
import {AuthService} from "../../../../../authentication/services/auth.service";
import {SrViewModelService} from "../../../shared/services/sr-view-model.service";
import {OrganizationsService} from "../../../../../backend-api/identity-registry/services/organizations.service";
import {ServiceRegistrySearchRequest} from "../../../../shared/components/service-registry-search/ServiceRegistrySearchRequest";
import {SrSearchRequestsService} from "../../../shared/services/sr-search-requests.service";
import {EndorsementsService} from "../../../../../backend-api/endorsements/services/endorsements.service";
import {SHOW_ENDORSEMENTS} from "../../../../../shared/app.constants";
import {Endorsement} from "../../../../../backend-api/endorsements/autogen/model/Endorsement";
import {Observable} from "rxjs/Observable";

const SEARCH_KEY = 'DesignDetailsComponent';

@Component({
  selector: 'design-details',
  encapsulation: ViewEncapsulation.None,
  template: require('./design-details.html'),
  styles: []
})
export class DesignDetailsComponent {
  public design: Design;
  public instances: Array<Instance>;
  public title:string;
  public labelValues:Array<LabelValueModel>;
  public isLoadingInstances: boolean;
  public isLoadingDesign: boolean;
  public onCreate: Function;
  public onGotoSpec: Function;
  public onGotoInstance: Function;
	public showModal:boolean = false;
	public modalDescription:string;
	public showModalNoDelete:boolean = false;
	public modalDescriptionNoDelete:string;

	// Endorsements
	public isLoadingEndorsements:boolean;
	public isEndorsing:boolean;
	public showEndorsements:boolean;
	public isEndorsedByMyOrg:boolean;
	public endorsements:Array<Endorsement> = [];
	public endorseMainSwitch = SHOW_ENDORSEMENTS;

	// Search
	public isSearchingInstances = false;
	public searchKey = SEARCH_KEY;

  constructor(private searchRequestsService:SrSearchRequestsService, private endorsementsService:EndorsementsService, private authService: AuthService, private route: ActivatedRoute, private router: Router, private viewModelService: SrViewModelService, private navigationHelperService: NavigationHelperService, private instancesService: InstancesService, private specificationsService: SpecificationsService, private notifications: MCNotificationsService, private designsService: DesignsService, private fileHelperService: FileHelperService, private orgsService: OrganizationsService) {

  }

  ngOnInit() {
    this.onCreate = this.createInstance.bind(this);
    this.onGotoSpec = this.gotoSpecification.bind(this);
    this.onGotoInstance = this.gotoInstance.bind(this);
    this.isLoadingDesign = true;
    this.isLoadingInstances = true;
    this.title = 'Loading ...';
	  let designId = this.route.snapshot.params['id'];
	  let version = this.route.snapshot.queryParams['designVersion'];
    this.loadDesign(designId, version);
	  if (SHOW_ENDORSEMENTS) {
		  this.loadEndorsements(designId, version);
	  }
  }

  public downloadXml() {
    this.fileHelperService.downloadXml(this.design.designAsXml);
  }

  public downloadDoc() {
    this.fileHelperService.downloadDoc(this.design.designAsDoc);
  }

  private loadDesign(designId:string, version:string) {
    this.designsService.getDesign(designId, version).subscribe(
      design => {
        this.title = design.name;
        this.design = design;
	      this.loadOrganizationName();
        this.loadInstances();
      },
      err => {
        // TODO: make this as a general component
        if (err.status == 404) {
          this.router.navigate(['/error404'], {relativeTo: this.route, replaceUrl: true })
        }
        this.title = 'Error while loading';
        this.isLoadingDesign = false;
        this.isLoadingInstances = false;
        this.notifications.generateNotification('Error', 'Error when trying to get design', MCNotificationType.Error, err);
      }
    );
  }


	private loadOrganizationName() {
		this.orgsService.getOrganizationName(this.design.organizationId).subscribe(
			organizationName => {
				this.labelValues = this.viewModelService.generateLabelValuesForDesign(this.design, organizationName);
				this.generateLabelValuesForSpecification();
				this.isLoadingDesign = false;
			},
			err => {
				this.labelValues = this.viewModelService.generateLabelValuesForSpecification(this.design, '');
				this.generateLabelValuesForSpecification();
				this.isLoadingDesign = false;
				this.notifications.generateNotification('Error', 'Error when trying to get organization', MCNotificationType.Error, err);
			}
		);
	}

  private loadInstances() {
	  let searchRequest = this.searchRequestsService.getSearchRequest(SEARCH_KEY);
	  this.searchDesigns(searchRequest);
  }

  private generateLabelValuesForSpecification() {
    if (this.design.specifications && this.design.specifications.length > 0) {
      let plur = (this.design.specifications.length > 1 ? 's' : '');
      var label = 'Implemented specification' + plur;
      this.design.specifications.forEach((specification) => {
        this.labelValues.push({label: label, valueHtml: specification.name + " - " + specification.version, linkFunction: this.onGotoSpec, linkValue: [specification.specificationId,specification.version]});
        label = "";
      });
    }
  }

  private createInstance() {
    this.navigationHelperService.navigateToCreateInstance(this.design.designId, this.design.version);
  }

  private gotoSpecification(linkValue: any) {
    try {
      this.navigationHelperService.navigateToOrgSpecification(linkValue[0], linkValue[1]);
    } catch ( error ) {
      this.notifications.generateNotification('Error', 'Error when trying to go to specification', MCNotificationType.Error, error);
    }
  }

  private gotoInstance(index:number) {
    this.navigationHelperService.navigateToOrgInstance(this.instances[index].instanceId, this.instances[index].version);
  }
	private isMyOrg():boolean {
		return this.design.organizationId === this.authService.authState.orgMrn;
	}

	public shouldDisplayDelete():boolean {
		return this.isServiceAdminForOrg() && !this.isLoadingInstances;
	}

	private hasInstances():boolean {
		return this.instances && this.instances.length > 0;
	}

	private delete() {
		if (this.hasInstances()) {
			this.modalDescriptionNoDelete = "Design can't be deleted with active Instances.<br><br>You must first delete the Instances.";
			this.showModalNoDelete = true;
		} else {
			this.modalDescription = 'Do you want to delete the design?';
			this.showModal = true;
		}
	}
	public cancelModal() {
		this.showModal = false;
		this.showModalNoDelete = false;
	}

	public deleteForSure() {
		this.isLoadingDesign = true;
		this.showModal = false;
		this.designsService.deleteDesign(this.design).subscribe(
			() => {
				this.deleteEndorsements();
			},
			err => {
				this.isLoadingDesign = false;
				this.notifications.generateNotification('Error', 'Error when trying to delete design', MCNotificationType.Error, err);
			}
		);
	}

	private isServiceAdminForOrg():boolean {
		return (this.authService.authState.isAdmin() && this.isMyOrg()) || this.authService.authState.isSiteAdmin();
	}

	public showUpdate():boolean {
		return this.isServiceAdminForOrg();
	}

	public update() {
		this.navigationHelperService.navigateToUpdateDesign(this.design.designId, this.design.version);
	}

	// Endorsements
	private deleteEndorsements() {
		if (this.endorsements && this.endorsements.length > 0) {
			this.endorsementsService.removeAllEndorsementsOfDesign(this.design.designId).subscribe(
				() => {
					this.navigationHelperService.navigateToOrgDesign('', '');
				},
				err => {
					this.notifications.generateNotification('Error', 'Error when trying to delete endorsements of design', MCNotificationType.Error, err);
					this.navigationHelperService.navigateToOrgDesign('', '');
				}
			);
		} else {
			this.navigationHelperService.navigateToOrgDesign('', '');
		}
	}

	private loadEndorsements(designId:string, designVersion) {
		this.isLoadingEndorsements = true;
		let parallelObservables = [];

		parallelObservables.push(this.endorsementsService.isDesignEndorsedByMyOrg(designId,designVersion).take(1));
		parallelObservables.push(this.endorsementsService.getEndorsementsForDesign(designId,designVersion).take(1));

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
				this.notifications.generateNotification('Error', 'Error when trying to get endorsements for design', MCNotificationType.Error, err);
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
		var specificationId = '';
		var specificationVersion = '';
		if (this.design.specifications && this.design.specifications.length > 0) {
			// TODO handle more specifications when endorse api has the functionality
			specificationId = this.design.specifications[0].specificationId;
			specificationVersion = this.design.specifications[0].version;
		}
		this.endorsementsService.endorseDesign(this.design.designId, this.design.version, specificationId, specificationVersion).subscribe(
			_ => {
				this.isEndorsedByMyOrg = true;
				this.isEndorsing = false;
				this.loadEndorsements(this.design.designId, this.design.version);
			},
			err => {
				this.isEndorsing = false;
				this.notifications.generateNotification('Error', 'Error when trying to endorse design', MCNotificationType.Error, err);
			}
		);
	}

	private removeEndorse() {
		this.isEndorsing = true;
		this.endorsementsService.removeEndorsementOfDesign(this.design.designId, this.design.version).subscribe(
			_ => {
				this.isEndorsedByMyOrg = false;
				this.isEndorsing = false;
				this.loadEndorsements(this.design.designId, this.design.version);
			},
			err => {
				this.isEndorsing = false;
				this.notifications.generateNotification('Error', 'Error when trying to remove endorse of design', MCNotificationType.Error, err);
			}
		);
	}

	public shouldDisplayEndorsementButton():boolean {
		return SHOW_ENDORSEMENTS && this.isServiceAdminForOrg() && this.showEndorsements;
	}

	// Search
	public search(searchRequest: ServiceRegistrySearchRequest) {
		this.isSearchingInstances = true;
		this.searchDesigns(searchRequest);
	}

	public searchDesigns(searchRequest:ServiceRegistrySearchRequest) {
		this.instancesService.searchInstancesForDesign(searchRequest, this.design.designId, this.design.version).subscribe(
			instances => {
				this.instances = instances;
				this.isLoadingInstances = false;
				this.isSearchingInstances = false;
			},
			err => {
				this.isLoadingInstances = false;
				this.isSearchingInstances = false;
				this.notifications.generateNotification('Error', 'Error when trying to search instances', MCNotificationType.Error, err);
			}
		);
	}
}
