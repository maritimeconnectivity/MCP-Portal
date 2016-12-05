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

  constructor(private authService: AuthService, private route: ActivatedRoute, private router: Router, private viewModelService: SrViewModelService, private navigationHelperService: NavigationHelperService, private instancesService: InstancesService, private notifications: MCNotificationsService, private designsService: DesignsService, private fileHelperService: FileHelperService) {

  }

  ngOnInit() {
    this.onGotoDesign = this.gotoDesign.bind(this);
    this.isLoadingInstance = true;
    this.title = 'Loading ...';
    this.loadInstance();
  }

  public downloadXml() {
    this.fileHelperService.downloadXml(this.instance.instanceAsXml);
  }

  public downloadDoc() {
    this.fileHelperService.downloadDoc(this.instance.instanceAsDoc);
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

  private loadDesign() {
    this.designsService.getDesignForInstance(this.instance).subscribe(
      design => {
        this.design = design;
        this.labelValues = this.viewModelService.generateLabelValuesForInstance(this.instance);
        this.generateLabelValueForDesign();
        this.isLoadingInstance = false;
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

  private gotoDesign(linkValue:any) {
    try {
      this.navigationHelperService.navigateToOrgDesign(linkValue[0], linkValue[1]);
    } catch ( error ) {
      this.notifications.generateNotification('Error', 'Error when trying to go to instance', MCNotificationType.Error, error);
    }
  }

  // TODO: until the SR can deliver the owner organization, only siteadmins can delete
	private isAdmin():boolean {
		return this.authService.authState.isSiteAdmin();
	}

	public shouldDisplayDelete():boolean {
		return this.isAdmin();
	}

	private delete() {
		this.modalDescription = 'Do you want to delete the design?';
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
				this.navigationHelperService.navigateToOrgInstance('', '');
			},
			err => {
				this.isLoadingInstance = false;
				this.notifications.generateNotification('Error', 'Error when trying to delete instance', MCNotificationType.Error, err);
			}
		);
	}
}
