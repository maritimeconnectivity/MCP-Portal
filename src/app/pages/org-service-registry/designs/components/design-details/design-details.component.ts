import { Component, ViewEncapsulation } from '@angular/core';
import {LabelValueModel} from "../../../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";
import {ActivatedRoute, Router} from "@angular/router";
import {FileHelperService} from "../../../../../shared/file-helper.service";
import {Design} from "../../../../../backend-api/service-registry/autogen/model/Design";
import {DesignsService} from "../../../../../backend-api/service-registry/services/designs.service";
import {Specification} from "../../../../../backend-api/service-registry/autogen/model/Specification";
import {NavigationHelperService} from "../../../../../shared/navigation-helper.service";
import {SpecificationsService} from "../../../../../backend-api/service-registry/services/specifications.service";
import {Instance} from "../../../../../backend-api/service-registry/autogen/model/Instance";
import {InstancesService} from "../../../../../backend-api/service-registry/services/instances.service";

@Component({
  selector: 'design-details',
  encapsulation: ViewEncapsulation.None,
  template: require('./design-details.html'),
  styles: []
})
export class DesignDetailsComponent {
  public design: Design;
  public specifications: Array<Specification>;
  public instances: Array<Instance>;
  public title:string;
  public labelValues:Array<LabelValueModel>;
  public isLoadingSpecifications: boolean;
  public isLoadingInstances: boolean;
  public isLoadingDesign: boolean;
  public onCreate: Function;
  public onGotoSpec: Function;
  public onGotoInstance: Function;

  constructor(private route: ActivatedRoute, private router: Router, private navigationHelperService: NavigationHelperService, private instancesService: InstancesService, private specificationsService: SpecificationsService, private notifications: MCNotificationsService, private designsService: DesignsService, private fileHelperService: FileHelperService) {

  }

  ngOnInit() {
    this.onCreate = this.createInstance.bind(this);
    this.onGotoSpec = this.gotoSpecification.bind(this);
    this.onGotoInstance = this.gotoInstance.bind(this);
    this.isLoadingDesign = true;
    this.isLoadingSpecifications = true;
    this.isLoadingInstances = true;
    this.title = 'Loading ...';
    this.loadDesign();
    this.loadSpecifications();
  }

  public downloadXml() {
    this.fileHelperService.downloadXml(this.design.designAsXml);
  }

  public downloadDoc() {
    this.fileHelperService.downloadDoc(this.design.designAsDoc);
  }

  private loadDesign() {
    let designId = this.route.snapshot.params['id'];
    this.designsService.getDesign(designId).subscribe(
      design => {
        this.title = design.name;
        this.design = design;
        this.generateLabelValues();
        this.isLoadingDesign = false;
        this.loadInstances();
      },
      err => {
        // TODO: make this as a general component
        if (err.status == 404) {
          this.router.navigate(['/error404'], {relativeTo: this.route })
        }
        this.title = 'Error while loading';
        this.isLoadingDesign = false;
        this.isLoadingInstances = false;
        this.notifications.generateNotification({title:'Error', message:'Error when trying to get design', type:MCNotificationType.Error});
      }
    );
  }

  private loadInstances() {
    this.instancesService.getInstancesForDesign(this.design.designId, this.design.version).subscribe(
      instances => {
        this.instances = instances;
        this.isLoadingInstances = false;
      },
      err => {
        this.isLoadingInstances = false;
        this.notifications.generateNotification({title:'Error', message:'Error when trying to get instances', type:MCNotificationType.Error});
      }
    );
  }

  // TODO this should be deleted and taken directly from the design-model when service registry has proper data. from design.specifications

  private loadSpecifications() {
    this.specificationsService.getSpecificationsForMyOrg().subscribe(
      specifications => {
        this.specifications = specifications;
        this.isLoadingSpecifications = false;
      },
      err => {
        this.isLoadingSpecifications = false;
        this.notifications.generateNotification({title:'Error', message:'Error when trying to get specifications', type:MCNotificationType.Error});
      }
    );
  }

  private generateLabelValues() {
    this.labelValues = undefined;
    if (this.design) {
      this.labelValues = [];
      this.labelValues.push({label: 'ID', valueHtml: this.design.designId});
      this.labelValues.push({label: 'Name', valueHtml: this.design.name});
      this.labelValues.push({label: 'Version', valueHtml: this.design.version});
      this.labelValues.push({label: 'Status', valueHtml: this.design.status});
      this.labelValues.push({label: 'Description', valueHtml: this.design.description});
    }
  }

  private createInstance() {
    this.notifications.generateNotification({title:'Not implemented', message:'Register new instance', type:MCNotificationType.Info});
  }

  private gotoSpecification(index:number) {
    this.navigationHelperService.navigateToOrgSpecification(this.specifications[index].specificationId);
  }

  private gotoInstance(index:number) {
    this.navigationHelperService.navigateToOrgInstance(this.instances[index].instanceId);
  }
}
