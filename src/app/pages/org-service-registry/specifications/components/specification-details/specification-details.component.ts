import { Component, ViewEncapsulation } from '@angular/core';
import {Specification} from "../../../../../backend-api/service-registry/autogen/model/Specification";
import {LabelValueModel} from "../../../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";
import {ActivatedRoute, Router, Routes} from "@angular/router";
import {SpecificationsService} from "../../../../../backend-api/service-registry/services/specifications.service";
import {FileHelperService} from "../../../../../shared/file-helper.service";
import {Design} from "../../../../../backend-api/service-registry/autogen/model/Design";
import {DesignsService} from "../../../../../backend-api/service-registry/services/designs.service";
import {LoadedRouterConfig} from "@angular/router/src/router_config_loader";
import {NavigationHelperService} from "../../../../../shared/navigation-helper.service";

@Component({
  selector: 'specification-details',
  encapsulation: ViewEncapsulation.None,
  template: require('./specification-details.html'),
  styles: []
})
export class SpecificationDetailsComponent {
  private specification: Specification;
  private designs: Array<Design>;
  private title:string;
  private labelValues:Array<LabelValueModel>;
  private isLoadingSpecification: boolean;
  private isLoadingDesigns: boolean;
  public onGotoDesign: Function;

  constructor(private route: ActivatedRoute, private navigationHelperService: NavigationHelperService,  private notifications: MCNotificationsService, private specificationsService: SpecificationsService, private designsService: DesignsService, private fileHelperService: FileHelperService) {

  }

  ngOnInit() {
    this.onGotoDesign = this.gotoDesign.bind(this);

    this.isLoadingSpecification = true;
    this.isLoadingDesigns = true;
    this.title = 'Loading ...';
    let specificationId = this.route.snapshot.params['id'];
    this.loadSpecification(specificationId);
  }

  public downloadXml() {
    this.fileHelperService.downloadXml(this.specification.specAsXml);
  }

  public downloadDoc() {
    this.fileHelperService.downloadDoc(this.specification.specAsDoc);
  }

  private gotoDesign(index:number) {
    this.navigationHelperService.navigateToOrgDesign(this.designs[index].designId);
  }

  private loadSpecification(specificationId:string) {
    this.specificationsService.getSpecification(specificationId).subscribe(
      specification => {
        this.title = specification.name;
        this.specification = specification;
        this.generateLabelValues();
        this.isLoadingSpecification = false;
        this.loadDesigns();
      },
      err => {
        // TODO: make this as a general component
        if (err.status == 404) {
          this.router.navigate(['/error404'], {relativeTo: this.route })
        }
        this.title = '';
        this.isLoadingSpecification = false;
        this.notifications.generateNotification({title:'Error', message:'Error when trying to get specification', type:MCNotificationType.Error});
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
        this.notifications.generateNotification({title:'Error', message:'Error when trying to get designs', type:MCNotificationType.Error});
      }
    );
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
