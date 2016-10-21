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

@Component({
  selector: 'design-details',
  encapsulation: ViewEncapsulation.None,
  template: require('./design-details.html'),
  styles: []
})
export class DesignDetailsComponent {
  public design: Design;
  public specifications: Array<Specification>;
  public title:string;
  public labelValues:Array<LabelValueModel>;
  public isLoadingSpecifications: boolean;
  public isLoadingDesign: boolean;
  public onGotoSpec: Function;

  constructor(private route: ActivatedRoute, private router: Router, private navigationHelperService: NavigationHelperService, private specificationsService: SpecificationsService, private notifications: MCNotificationsService, private designsService: DesignsService, private fileHelperService: FileHelperService) {

  }

  ngOnInit() {
    this.onGotoSpec = this.gotoSpecification.bind(this);
    this.isLoadingDesign = true;
    this.isLoadingSpecifications = true;
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
      },
      err => {
        // TODO: make this as a general component
        if (err.status == 404) {
          this.router.navigate(['/error404'], {relativeTo: this.route })
        }
        this.title = '';
        this.isLoadingDesign = false;
        this.notifications.generateNotification({title:'Error', message:'Error when trying to get design', type:MCNotificationType.Error});
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

  private gotoSpecification(index:number) {
    this.navigationHelperService.navigateToOrgSpecification(this.specifications[index].specificationId);
  }
}
