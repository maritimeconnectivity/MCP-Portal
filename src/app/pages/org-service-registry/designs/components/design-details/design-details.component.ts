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
import {ViewModelService} from "../../../../shared/services/view-model.service";

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
  public isLoadingInstances: boolean;
  public isLoadingDesign: boolean;
  public onCreate: Function;
  public onGotoSpec: Function;
  public onGotoInstance: Function;

  constructor(private route: ActivatedRoute, private router: Router, private viewModelService: ViewModelService, private navigationHelperService: NavigationHelperService, private instancesService: InstancesService, private specificationsService: SpecificationsService, private notifications: MCNotificationsService, private designsService: DesignsService, private fileHelperService: FileHelperService) {

  }

  ngOnInit() {
    this.onCreate = this.createInstance.bind(this);
    this.onGotoSpec = this.gotoSpecification.bind(this);
    this.onGotoInstance = this.gotoInstance.bind(this);
    this.isLoadingDesign = true;
    this.isLoadingInstances = true;
    this.title = 'Loading ...';
    this.loadDesign();
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
        this.loadSpecifications();
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
        this.notifications.generateNotification('Error', 'Error when trying to get design', MCNotificationType.Error);
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
        this.notifications.generateNotification('Error', 'Error when trying to get instances', MCNotificationType.Error);
      }
    );
  }

  // TODO this should be deleted and taken directly from the design-model when service registry has proper data. from design.specifications

  private loadSpecifications() {
    this.specificationsService.getSpecificationsForMyOrg().subscribe(
      specifications => {
        this.specifications = specifications;
        this.labelValues = this.viewModelService.generateLabelValuesForDesign(this.design);
        this.generateLabelValuesForSpecification();
        this.isLoadingDesign = false;
      },
      err => {
        this.isLoadingDesign = false;
        this.notifications.generateNotification('Error', 'Error when trying to get specifications', MCNotificationType.Error);
      }
    );
  }

  private generateLabelValuesForSpecification() {
    if (this.specifications && this.specifications.length > 0) {
      let plur = (this.specifications.length > 1 ? 's' : '');
      var label = 'Implemented specification' + plur;
      this.specifications.forEach((specification) => {
        this.labelValues.push({label: label, valueHtml: specification.name + " - " + specification.version, linkFunction: this.onGotoSpec, linkValue: specification.specificationId});
        label = "";
      });
    }
  }

  private createInstance() {
    this.navigationHelperService.navigateToCreateSInstance(this.design.designId, this.design.version);
  }

  private gotoSpecification(specificationId:string) {
    this.navigationHelperService.navigateToOrgSpecification(specificationId);
  }

  private gotoInstance(index:number) {
    this.navigationHelperService.navigateToOrgInstance(this.instances[index].instanceId);
  }
}
