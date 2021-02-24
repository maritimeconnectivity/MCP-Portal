import { Injectable, OnInit } from '@angular/core';
import { Specification } from "../../../../backend-api/service-registry/autogen/model/Specification";
import { LabelValueModel } from "../../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";
import { Design } from "../../../../backend-api/service-registry/autogen/model/Design";
import { Instance } from "../../../../backend-api/service-registry/autogen/model/Instance";
import { McUtils } from "../../../../shared/mc-utils";
import { isNullOrUndefined } from "util";

@Injectable()
export class SrViewModelService implements OnInit {
  constructor() {
  }

  ngOnInit() {

  }

  public generateLabelValuesForSpecification(specification:Specification, organizationName:string):Array<LabelValueModel> {
    var labelValues:Array<LabelValueModel> = undefined;
    if (specification) {
      labelValues = [];
      labelValues.push({label: 'MRN', valueHtml: specification.specificationId});
      labelValues.push({label: 'Name', valueHtml: specification.name});
      labelValues.push({label: 'Version', valueHtml: specification.version});
	    labelValues.push({label: 'Status', valueHtml: specification.status});
		  labelValues.push({label: 'Organization', valueHtml: organizationName});
      labelValues.push({label: 'Description', valueHtml: specification.description});
    }
    return labelValues
  }

  public generateLabelValuesForDesign(design:Design, organizationName:string):Array<LabelValueModel> {
    var labelValues:Array<LabelValueModel> = undefined;
    if (design) {
      labelValues = [];
      labelValues.push({label: 'MRN', valueHtml: design.designId});
      labelValues.push({label: 'Name', valueHtml: design.name});
      labelValues.push({label: 'Version', valueHtml: design.version});
      labelValues.push({label: 'Status', valueHtml: design.status});
	    labelValues.push({label: 'Organization', valueHtml: organizationName});
      labelValues.push({label: 'Description', valueHtml: design.description});
    }
    return labelValues;
  }

  public generateLabelValuesForInstance(instance:Instance, organizationName:string):Array<LabelValueModel> {
    var labelValues:Array<LabelValueModel> = undefined;
    if (instance) {
      labelValues = [];
      labelValues.push({label: 'MRN', valueHtml: instance.instanceId});
      labelValues.push({label: 'Name', valueHtml: instance.name});
      labelValues.push({label: 'Version', valueHtml: instance.version});
      labelValues.push({label: 'Status', valueHtml: instance.status});
	    labelValues.push({label: 'Organization', valueHtml: organizationName});
      labelValues.push({label: 'Description', valueHtml: instance.description});
	    labelValues.push({label: 'Service endpoint', valueHtml: instance.endpointUri});

	    if (!isNullOrUndefined(instance.compliant)) {
	    	let compliantClass =  instance.compliant ? '' : 'label-danger';
		    labelValues.push({label: 'Compliant', valueHtml: McUtils.getYesNoString(instance.compliant), linkClass: compliantClass});
	    }
    }
    return labelValues;
  }

}
