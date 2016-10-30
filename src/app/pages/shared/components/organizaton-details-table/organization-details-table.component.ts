import {Component, ViewEncapsulation, Input, OnChanges} from '@angular/core';
import {LabelValueModel} from "../../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";
import {Organization} from "../../../../backend-api/identity-registry/autogen/model/Organization";
import {OrganizationViewModelService} from "../../services/organization-view-model.service";

@Component({
  selector: 'organization-details-table',
  encapsulation: ViewEncapsulation.None,
  template: require('./organization-details-table.html'),
  styles: []
})
export class OrganizationDetailsTableComponent implements OnChanges {
  private labelValues:Array<LabelValueModel>;
  @Input() isLoading:boolean;
  @Input() organization: Organization;
  constructor(private orgViewModelService: OrganizationViewModelService) {
  }
  ngOnChanges() {
    if (this.organization) {
      this.labelValues = this.orgViewModelService.generateLabelValuesForOrganization(this.organization);
    }
  }

}
