import { Component, ViewEncapsulation } from '@angular/core';
import {Specification} from "../../../../../backend-api/service-registry/autogen/model/Specification";
import {LabelValueModel} from "../../../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";
import {ActivatedRoute, Router} from "@angular/router";
import {SpecificationsService} from "../../../../../backend-api/service-registry/services/specifications.service";
import {FileHelperService} from "../../../../../shared/file-helper.service";
import {Design} from "../../../../../backend-api/service-registry/autogen/model/Design";
import {DesignsService} from "../../../../../backend-api/service-registry/services/designs.service";
import {NavigationHelperService} from "../../../../../shared/navigation-helper.service";
import {InstancesService} from "../../../../../backend-api/service-registry/services/instances.service";
import {Instance} from "../../../../../backend-api/service-registry/autogen/model/Instance";
import {SrViewModelService} from "../../../shared/services/sr-view-model.service";
import {AuthService} from "../../../../../authentication/services/auth.service";
import {OrganizationsService} from "../../../../../backend-api/identity-registry/services/organizations.service";

@Component({
  selector: 'specification-details',
  encapsulation: ViewEncapsulation.None,
  template: require('./specification-details.html'),
  styles: []
})
export class SpecificationDetailsComponent {
  public specification: Specification;
  public designs: Array<Design>;
  public instances: Array<Instance>;
  public title:string;
  public labelValues:Array<LabelValueModel>;
  public isLoadingSpecification: boolean;
  public isLoadingDesigns: boolean;
  public isLoadingInstances: boolean;
  public onCreate: Function;
  public onGotoDesign: Function;
  public onGotoInstance: Function;
	public showModal:boolean = false;
	public showModalNoDelete:boolean = false;
	public modalDescription:string;
	public modalDescriptionNoDelete:string;

  constructor(private authService: AuthService, private route: ActivatedRoute, private router: Router, private viewModelService: SrViewModelService, private navigationHelperService: NavigationHelperService, private instancesService: InstancesService, private notifications: MCNotificationsService, private specificationsService: SpecificationsService, private designsService: DesignsService, private fileHelperService: FileHelperService, private orgsService: OrganizationsService) {

  }

  ngOnInit() {
    this.onCreate = this.createDesign.bind(this);
    this.onGotoDesign = this.gotoDesign.bind(this);
    this.onGotoInstance = this.gotoInstance.bind(this);

    this.isLoadingSpecification = true;
    this.isLoadingDesigns = true;
    this.isLoadingInstances = true;
    this.title = 'Loading ...';
    let specificationId = this.route.snapshot.params['id'];
    let version = this.route.snapshot.queryParams['specificationVersion'];
    this.loadSpecification(specificationId, version);
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
        this.loadInstances();
      },
      err => {
        // TODO: make this as a general component
        if (err.status == 404) {
          this.router.navigate(['/error404'], {relativeTo: this.route, replaceUrl: true })
        }
        this.title = 'Error while loading';
        this.isLoadingSpecification = false;
        this.isLoadingDesigns = false;
        this.isLoadingInstances = false;
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

  private loadInstances() {
    this.instancesService.getInstancesForSpecification(this.specification.specificationId, this.specification.version).subscribe(
      instances => {
        this.instances = instances;
        this.isLoadingInstances = false;
      },
      err => {
        this.isLoadingInstances = false;
        this.notifications.generateNotification('Error', 'Error when trying to get instances', MCNotificationType.Error, err);
      }
    );
  }

  private loadDesigns() {
    this.designsService.getDesignsForSpecification(this.specification.specificationId, this.specification.version).subscribe(
      designs => {
        this.designs = designs;
        this.isLoadingDesigns = false;
      },
      err => {
        this.isLoadingDesigns = false;
        this.notifications.generateNotification('Error', 'Error when trying to get designs', MCNotificationType.Error, err);
      }
    );
  }

  private createDesign() {
    this.navigationHelperService.navigateToCreateDesign(this.specification.specificationId, this.specification.version);
  }

  private gotoInstance(index:number) {
    this.navigationHelperService.navigateToOrgInstance(this.instances[index].instanceId, this.instances[index].version);
  }

	private isMyOrg():boolean {
		return this.specification.organizationId === this.authService.authState.orgMrn;
	}

	private isAdmin():boolean {
		return (this.authService.authState.isAdmin() && this.isMyOrg()) ||  this.authService.authState.isSiteAdmin();
	}

	public shouldDisplayDelete():boolean {
		return this.isAdmin() && !this.isLoadingDesigns;
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
				this.navigationHelperService.navigateToOrgSpecification('', '');
			},
			err => {
				this.isLoadingSpecification = false;
				this.notifications.generateNotification('Error', 'Error when trying to delete specification', MCNotificationType.Error, err);
			}
		);
	}
}
