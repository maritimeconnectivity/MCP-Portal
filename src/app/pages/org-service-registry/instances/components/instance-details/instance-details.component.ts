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
import {ViewModelService} from "../../../../shared/services/view-model.service";

@Component({
  selector: 'instance-details',
  encapsulation: ViewEncapsulation.None,
  template: require('./instance-details.html'),
  styles: []
})
export class InstanceDetailsComponent {
  public instance: Instance;
  public designs: Array<Design>;
  public title:string;
  public labelValues:Array<LabelValueModel>;
  public isLoadingDesigns: boolean;
  public isLoadingInstance: boolean;
  public onGotoDesign: Function;

  constructor(private route: ActivatedRoute, private router: Router, private viewModelService: ViewModelService, private navigationHelperService: NavigationHelperService, private instancesService: InstancesService, private notifications: MCNotificationsService, private designsService: DesignsService, private fileHelperService: FileHelperService) {

  }

  ngOnInit() {
    this.onGotoDesign = this.gotoDesign.bind(this);
    this.isLoadingInstance = true;
    this.isLoadingDesigns = true;
    this.title = 'Loading ...';
    this.loadInstance();
    this.loadDesigns();
  }

  public downloadXml() {
    this.fileHelperService.downloadXml(this.instance.instanceAsXml);
  }

  public downloadDoc() {
    this.fileHelperService.downloadDoc(this.instance.instanceAsDoc);
  }

  private loadInstance() {
    let instanceId = this.route.snapshot.params['id'];
    this.instancesService.getInstance(instanceId).subscribe(
      instance => {
        this.title = instance.name;
        this.instance = instance;
        this.labelValues = this.viewModelService.generateLabelValuesForInstance(instance);
        this.isLoadingInstance = false;
      },
      err => {
        // TODO: make this as a general component
        if (err.status == 404) {
          this.router.navigate(['/error404'], {relativeTo: this.route, replaceUrl: true })
        }
        this.title = 'Error while loading';
        this.isLoadingInstance = false;
        this.notifications.generateNotification('Error', 'Error when trying to get instance', MCNotificationType.Error);
      }
    );
  }

  // TODO this should be deleted and taken directly from the instance-model when service registry has proper data. from instance.designs

  private loadDesigns() {
    this.designsService.getDesignsForMyOrg().subscribe(
      designs => {
        this.designs = designs;
        this.isLoadingDesigns = false;
      },
      err => {
        this.isLoadingDesigns = false;
        this.notifications.generateNotification('Error', 'Error when trying to get designs', MCNotificationType.Error);
      }
    );
  }

  private gotoDesign(index:number) {
    this.navigationHelperService.navigateToOrgDesign(this.designs[index].designId);
  }
}
