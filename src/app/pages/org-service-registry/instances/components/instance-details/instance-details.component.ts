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

  constructor(private servicesService:IdServicesService, private authService: AuthService, private route: ActivatedRoute, private router: Router, private viewModelService: SrViewModelService, private navigationHelperService: NavigationHelperService, private instancesService: InstancesService, private notifications: MCNotificationsService, private designsService: DesignsService, private fileHelperService: FileHelperService, private mrnHelper: MrnHelperService, private docsService: DocsService, private orgsService: OrganizationsService) {

  }

  ngOnInit() {
    this.onGotoDesign = this.gotoDesign.bind(this);
	  this.shouldDisplayCreateButton = false;
	  this.isLoadingInstance = true;
	  this.isLoadingIdService = true;
    this.title = 'Loading ...';
	  this.titleIdService = 'ID information';
    this.loadInstance();
  }

  public downloadXml() {
    this.fileHelperService.downloadXml(this.instance.instanceAsXml);
  }

  public downloadDoc() {
	  this.fileHelperService.downloadDoc(this.instance.instanceAsDoc);
  }

  public createIdService() {
		this.navigationHelperService.navigateToCreateIdService(this.instance.instanceId, this.instance.name);
  }

  private isMyOrg():boolean {
	  return this.instance.organizationId === this.authService.authState.orgMrn;
  }


  private loadInstance() {
    let instanceId = this.route.snapshot.params['id'];
    let version = this.route.snapshot.queryParams['instanceVersion'];
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
	  this.servicesService.getIdService(mrn, this.instance.organizationId).subscribe(
		  service => {
			  this.idService = service;
			  this.showUpdateIdService = (this.isMyOrg() && this.isAdmin()) /* TODO for now only update if my org, because updating another orgs entities is a quite different kind of woopass|| this.authService.authState.isSiteAdmin()*/;
			  this.isLoadingIdService = false;
		  },
		  err => {
			  if (err.status == 404) {
				  this.shouldDisplayIdService = false;
				  this.shouldDisplayCreateButton = this.isAdmin();
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
		this.navigationHelperService.navigateToUpdateIdService(this.idService.mrn);
	}

  private gotoDesign(linkValue:any) {
    try {
      this.navigationHelperService.navigateToOrgDesign(linkValue[0], linkValue[1]);
    } catch ( error ) {
      this.notifications.generateNotification('Error', 'Error when trying to go to instance', MCNotificationType.Error, error);
    }
  }

	private isAdmin():boolean {
		return (this.authService.authState.isAdmin() && this.isMyOrg()) || this.authService.authState.isSiteAdmin();
	}

	public showUpdate():boolean {
		return this.isAdmin();
	}

	public showDelete():boolean {
		return this.isAdmin();
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
			this.servicesService.deleteIdService(this.idService.mrn).subscribe(
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
}
