import {Injectable, OnInit} from '@angular/core';
import {Organization} from "../../../backend-api/identity-registry/autogen/model/Organization";
import {LabelValueModel} from "../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";

@Injectable()
export class OrganizationViewModelService implements OnInit {
  constructor() {
  }

  ngOnInit() {

  }
  public generateLabelValuesForOrganization(organization:Organization):Array<LabelValueModel>  {
    var labelValues:Array<LabelValueModel> = undefined;
    if (organization) {
      labelValues = [];
      labelValues.push({label: 'MRN', valueHtml: organization.mrn});
      labelValues.push({label: 'Address', valueHtml: organization.address});
      labelValues.push({label: 'Country', valueHtml: organization.country});
      if (organization.email) {
        labelValues.push({label: 'Email', valueHtml: "<a href='mailto:" + organization.email + "'>" + organization.email + "</a>"});
      }
      if (organization.url) {
        labelValues.push({label: 'Website', valueHtml: "<a href='" + organization.url + "' target='_blank'>" + organization.url + "</a>"});
      }
    }
    return labelValues;
  }
}
