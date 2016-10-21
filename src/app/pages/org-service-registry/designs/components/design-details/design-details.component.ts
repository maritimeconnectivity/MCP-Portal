import { Component, ViewEncapsulation } from '@angular/core';
import {LabelValueModel} from "../../../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";
import {ActivatedRoute, Router} from "@angular/router";
import {FileHelperService} from "../../../../../shared/file-helper.service";
import {Design} from "../../../../../backend-api/service-registry/autogen/model/Design";
import {DesignsService} from "../../../../../backend-api/service-registry/services/designs.service";

@Component({
  selector: 'design-details',
  encapsulation: ViewEncapsulation.None,
  template: require('./design-details.html'),
  styles: []
})
export class DesignDetailsComponent {
  private design: Design;
  private title:string;
  private labelValues:Array<LabelValueModel>;
  private isLoading: boolean;

  constructor(private route: ActivatedRoute, private router: Router, private notifications: MCNotificationsService, private designsService: DesignsService, private fileHelperService: FileHelperService) {

  }

  ngOnInit() {
    this.isLoading = true;
    this.title = 'Loading ...';
    let designId = this.route.snapshot.params['id'];
    this.designsService.getDesign(designId).subscribe(
      design => {
        this.title = design.name;
        this.design = design;
        this.generateLabelValues();
        this.isLoading = false;
      },
      err => {
        // TODO: make this as a general component
        if (err.status == 404) {
          this.router.navigate(['/error404'], {relativeTo: this.route })
        }
        this.title = '';
        this.isLoading = false;
        this.notifications.generateNotification({title:'Error', message:'Error when trying to get design', type:MCNotificationType.Error});
      }
    );
  }

  public downloadXml() {
    this.fileHelperService.downloadXml(this.design.designAsXml);
  }

  public downloadDoc() {
    this.fileHelperService.downloadDoc(this.design.designAsDoc);
  }

  private generateLabelValues() {
    this.labelValues = undefined;
    if (this.design) {
      this.labelValues = [];
      this.labelValues.push({label: 'ID', valueHtml: this.design.designId});
      this.labelValues.push({label: 'Name', valueHtml: this.design.name});
      this.labelValues.push({label: 'Version', valueHtml: this.design.version});
      this.labelValues.push({label: 'Status', valueHtml: this.design.status});
      this.labelValues.push({label: 'Transport', valueHtml: this.design.transport});
      this.labelValues.push({label: 'Description', valueHtml: this.design.description});
    }
  }
}
