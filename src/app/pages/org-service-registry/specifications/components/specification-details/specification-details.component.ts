import { Component, ViewEncapsulation } from '@angular/core';
import {Specification} from "../../../../../backend-api/service-registry/autogen/model/Specification";
import {LabelValueModel} from "../../../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";
import {ActivatedRoute} from "@angular/router";
import {SpecificationsService} from "../../../../../backend-api/service-registry/services/specifications.service";
import {forEach} from "@angular/router/src/utils/collection";

@Component({
  selector: 'specification-details',
  encapsulation: ViewEncapsulation.None,
  template: require('./specification-details.html'),
  styles: []
})
export class SpecificationDetailsComponent {
  private specification: Specification;
  private title:string;
  private labelValues:Array<LabelValueModel>;
  private isLoading: boolean;
  /*constructor() {
    this.specification = {name: 'Try my name'};
    var labelValue1: LabelValueModel = {label: 'First label', valueHtml: 'First label'};
    var labelValue2: LabelValueModel = {label: 'First label a bit longer', valueHtml: "Just some text <i class='fa fa-amazon' aria-hidden='true'></i>"};
    this.labelValues = [labelValue1, labelValue2];
  }*/

  constructor(private route: ActivatedRoute, private notifications: MCNotificationsService, private specificationsService: SpecificationsService) {

  }

  ngOnInit() {
    this.isLoading = true;
    this.title = 'Loading ...';
    let specificationId = this.route.snapshot.params['id'];
    this.specificationsService.getSpecification(specificationId).subscribe(
      specification => {
        this.title = specification.name;
        this.specification = specification;
        this.generateLabelValues();
        this.isLoading = false;
      },
      err => {
        this.title = '';
        this.isLoading = false;
        this.notifications.generateNotification({title:'Error', message:'Error when trying to get specification', type:MCNotificationType.Error});
      }
    );
  }

  public downloadXml() {
    this.notifications.generateNotification({title:'Not implemented', message:'Downlad XML', type:MCNotificationType.Info});
  }

  public downloadDoc() {
    this.notifications.generateNotification({title:'Not implemented', message:'Download Document', type:MCNotificationType.Info});
  }

  private generateLabelValues() {
    this.labelValues = undefined;
    if (this.specification) {
      this.labelValues = [];
      this.labelValues.push({label: 'ID', valueHtml: this.specification.specificationId});
      this.labelValues.push({label: 'Name', valueHtml: this.specification.name});
      this.labelValues.push({label: 'Version', valueHtml: this.specification.version});
      this.labelValues.push({label: 'Status', valueHtml: this.specification.status});
      this.labelValues.push({label: 'Description', valueHtml: this.specification.description});
    }
  }
}
