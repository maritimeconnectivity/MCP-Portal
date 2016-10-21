import { Component, ViewEncapsulation } from '@angular/core';
import {Specification} from "../../../../../backend-api/service-registry/autogen/model/Specification";
import {LabelValueModel} from "../../../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";
import {ActivatedRoute, Router} from "@angular/router";
import {SpecificationsService} from "../../../../../backend-api/service-registry/services/specifications.service";
import {FileHelperService} from "../../../../../shared/file-helper.service";

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

  constructor(private route: ActivatedRoute, private router: Router, private notifications: MCNotificationsService, private specificationsService: SpecificationsService, private fileHelperService: FileHelperService) {

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
        // TODO: make this as a general component
        if (err.status == 404) {
          this.router.navigate(['/error404'], {relativeTo: this.route })
        }
        this.title = '';
        this.isLoading = false;
        this.notifications.generateNotification({title:'Error', message:'Error when trying to get specification', type:MCNotificationType.Error});
      }
    );
  }

  public downloadXml() {
    this.fileHelperService.downloadXml(this.specification.specAsXml);
  }

  public downloadDoc() {
    this.fileHelperService.downloadDoc(this.specification.specAsDoc);
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
