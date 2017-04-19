import { Component, ViewEncapsulation } from '@angular/core';
import {LabelValueModel} from "../../../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";
import {ActivatedRoute, Router} from "@angular/router";
import {FileHelperService} from "../../../../../shared/file-helper.service";
import {NavigationHelperService} from "../../../../../shared/navigation-helper.service";
import {Instance} from "../../../../../backend-api/service-registry/autogen/model/Instance";
import {InstancesService} from "../../../../../backend-api/service-registry/services/instances.service";
import {Design} from "../../../../../backend-api/service-registry/autogen/model/Design";
import {DesignsService} from "../../../../../backend-api/service-registry/services/designs.service";
import {SrViewModelService} from "../../../shared/services/sr-view-model.service";
import {AuthService} from "../../../../../authentication/services/auth.service";
import {Service} from "../../../../../backend-api/identity-registry/autogen/model/Service";
import {MrnHelperService} from "../../../../../shared/mrn-helper.service";
import {IdServicesService} from "../../../../../backend-api/identity-registry/services/id-services.service";
import {DocsService} from "../../../../../backend-api/service-registry/services/docs.service";
import {OrganizationsService} from "../../../../../backend-api/identity-registry/services/organizations.service";
import {SHOW_ENDORSEMENTS} from "../../../../../shared/app.constants";
import {Endorsement} from "../../../../../backend-api/endorsements/autogen/model/Endorsement";
import {EndorsementsService} from "../../../../../backend-api/endorsements/services/endorsements.service";
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'instance-details',
  encapsulation: ViewEncapsulation.None,
  template: require('./instance-details.html'),
  styles: []
})
export class InstanceDetailsComponent {
  public instance: Instance;
  public design: Design;
  public title:string;
  public labelValues:Array<LabelValueModel>;
  public isLoadingInstance: boolean;
  public onGotoDesign: Function;
	public showModal:boolean = false;
	public modalDescription:string;

	public isLoadingIdService: boolean;
	public titleIdService:string;
	public idService:Service;
	public shouldDisplayIdService:boolean = false;
	public shouldDisplayCreateButton:boolean = false;
	public showUpdateIdService:boolean = false;

	// Endorsements
	public isLoadingEndorsements:boolean;
	public isEndorsing:boolean;
	public showEndorsements:boolean;
	public isEndorsedByMyOrg:boolean;
	public endorsements:Array<Endorsement> = [];
	public endorseMainSwitch = SHOW_ENDORSEMENTS;

  constructor(private servicesService:IdServicesService, private endorsementsService:EndorsementsService, private authService: AuthService, private route: ActivatedRoute, private router: Router, private viewModelService: SrViewModelService, private navigationHelperService: NavigationHelperService, private instancesService: InstancesService, private notifications: MCNotificationsService, private designsService: DesignsService, private fileHelperService: FileHelperService, private mrnHelper: MrnHelperService, private docsService: DocsService, private orgsService: OrganizationsService) {

  }

  ngOnInit() {
    this.onGotoDesign = this.gotoDesign.bind(this);
	  this.shouldDisplayCreateButton = false;
	  this.isLoadingInstance = true;
	  this.isLoadingIdService = true;
    this.title = 'Loading ...';
	  this.titleIdService = 'ID information';
	  let instanceId = this.route.snapshot.params['id'];
	  let version = this.route.snapshot.queryParams['instanceVersion'];
    this.loadInstance(instanceId, version);
	  if (SHOW_ENDORSEMENTS) {
		  this.loadEndorsements(instanceId);
	  }
  }

  public downloadXml() {
    this.fileHelperService.downloadXml(this.instance.instanceAsXml);
  }

  public downloadDoc() {
	  this.fileHelperService.downloadDoc(this.instance.instanceAsDoc);
  }

  public createIdService() {
		this.navigationHelperService.navigateToCreateIdService(this.instance.instanceId, this.instance.name, this.instance.version);
  }

  private isMyOrg():boolean {
	  return this.instance.organizationId === this.authService.authState.orgMrn;
  }


  private loadInstance(instanceId:string, version:string) {
    this.instancesService.getInstance(instanceId, version).subscribe(
      instance => {
        this.title = instance.name;
        this.instance = instance;
        this.loadDesign();
      },
      err => {
        // TODO: make this as a general component
        if (err.status == 404) {
          this.router.navigate(['/error404'], {relativeTo: this.route, replaceUrl: true })
        }
        this.title = 'Error while loading';
        this.isLoadingInstance = false;
        this.notifications.generateNotification('Error', 'Error when trying to get instance', MCNotificationType.Error, err);
      }
    );
  }

	private loadOrganizationName() {
		this.orgsService.getOrganizationName(this.instance.organizationId).subscribe(
			organizationName => {
				this.labelValues = this.viewModelService.generateLabelValuesForInstance(this.instance, organizationName);
				this.finalizeLoading();
			},
			err => {
				this.labelValues = this.viewModelService.generateLabelValuesForInstance(this.instance, '');
				this.finalizeLoading();
				this.notifications.generateNotification('Error', 'Error when trying to get organization', MCNotificationType.Error, err);
			}
		);
	}

	private finalizeLoading() {
		this.generateLabelValueForDesign();
		this.isLoadingInstance = false;
		if (this.isMyOrg() || this.authService.authState.isSiteAdmin()) {
			this.shouldDisplayIdService = true;
			this.loadIdService(this.instance.instanceId);
		}
	}

  private loadIdService(mrn:string) {
	  this.servicesService.getIdService(mrn, this.instance.version, this.instance.organizationId).subscribe(
		  service => {
			  this.idService = service;
			  this.showUpdateIdService = (this.isMyOrg() && this.isServiceAdminForOrg()) /* TODO for now only update if my org, because updating another orgs entities is a quite different kind of woopass|| this.authService.authState.isSiteAdmin()*/;
			  this.isLoadingIdService = false;
		  },
		  err => {
			  if (err.status == 404) {
				  this.shouldDisplayIdService = false;
				  this.shouldDisplayCreateButton = this.isServiceAdminForOrg();
			  } else {
			    this.notifications.generateNotification('Error', 'Error when trying to get the service', MCNotificationType.Error, err);
			  }
			  this.isLoadingIdService = false;
		  }
	  );
  }

  private loadDesign() {
    this.designsService.getDesignForInstance(this.instance).subscribe(
      design => {
        this.design = design;
	      this.loadOrganizationName();
      },
      err => {
        this.isLoadingInstance = false;
        this.notifications.generateNotification('Error', 'Error when trying to get design', MCNotificationType.Error, err);
      }
    );
  }

  private generateLabelValueForDesign() {
    if (this.design) {
      var label = 'Implemented design';
	    this.labelValues.push({label: label, valueHtml: this.design.name + " - " + this.design.version, linkFunction: this.onGotoDesign, linkValue: [this.design.designId, this.design.version]});
    }
  }

	public updateIdService() {
		this.navigationHelperService.navigateToUpdateIdService(this.idService.mrn, this.instance.version);
	}

  private gotoDesign(linkValue:any) {
    try {
      this.navigationHelperService.navigateToOrgDesign(linkValue[0], linkValue[1]);
    } catch ( error ) {
      this.notifications.generateNotification('Error', 'Error when trying to go to instance', MCNotificationType.Error, error);
    }
  }

	private isServiceAdminForOrg():boolean {
		return (this.authService.authState.isAdmin() && this.isMyOrg()) || this.authService.authState.isSiteAdmin();
	}

	public showUpdate():boolean {
		return this.isServiceAdminForOrg();
	}

	public showDelete():boolean {
		return this.isServiceAdminForOrg();
	}

	public update() {
		this.navigationHelperService.navigateToUpdateInstance(this.instance.instanceId, this.instance.version);
	}

	public delete() {
		this.modalDescription = 'Do you want to delete the instance?';
		this.showModal = true;
	}
	public cancelModal() {
		this.showModal = false;
	}

	public deleteForSure() {
		this.isLoadingInstance = true;
		this.showModal = false;
		this.instancesService.deleteInstance(this.instance).subscribe(
			() => {
				this.deleteIdService();
			},
			err => {
				this.isLoadingInstance = false;
				this.notifications.generateNotification('Error', 'Error when trying to delete instance', MCNotificationType.Error, err);
			}
		);
	}

	private deleteIdService() {
  	if (this.idService) {
			this.servicesService.deleteIdService(this.idService.mrn, this.instance.version).subscribe(
				() => {
					this.navigationHelperService.navigateToOrgInstance('', '');
				},
				err => {
					this.navigationHelperService.navigateToOrgInstance('', '');
				}
			);
	  } else {
		  this.navigationHelperService.navigateToOrgInstance('', '');
	  }
	}

	private isAdmin():boolean {
		return (this.authService.authState.isAdmin() && this.isMyOrg()) ||  this.authService.authState.isSiteAdmin();
	}

	// Endorsements
	private loadEndorsements(instanceId:string) {
		this.isLoadingEndorsements = true;
		let parallelObservables = [];

		parallelObservables.push(this.endorsementsService.isInstanceEndorsedByMyOrg(instanceId).take(1));
		parallelObservables.push(this.endorsementsService.getEndorsementsForInstance(instanceId).take(1));

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
				this.notifications.generateNotification('Error', 'Error when trying to get endorsements for instance', MCNotificationType.Error, err);
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

		this.endorsementsService.endorseInstance(this.instance.instanceId, this.design.designId).subscribe(
			_ => {
				this.isEndorsedByMyOrg = true;
				this.isEndorsing = false;
				this.loadEndorsements(this.instance.instanceId);
			},
			err => {
				this.isEndorsing = false;
				this.notifications.generateNotification('Error', 'Error when trying to endorse instance', MCNotificationType.Error, err);
			}
		);
	}

	private removeEndorse() {
		this.isEndorsing = true;
		this.endorsementsService.removeEndorsementOfInstance(this.instance.instanceId).subscribe(
			_ => {
				this.isEndorsedByMyOrg = false;
				this.isEndorsing = false;
				this.loadEndorsements(this.instance.instanceId);
			},
			err => {
				this.isEndorsing = false;
				this.notifications.generateNotification('Error', 'Error when trying to remove endorse of instance', MCNotificationType.Error, err);
			}
		);
	}

	public shouldDisplayEndorsementButton():boolean {
		return SHOW_ENDORSEMENTS && this.isAdmin() && this.showEndorsements;
	}
}
