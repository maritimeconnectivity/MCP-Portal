import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { NgaModule } from '../../theme/nga.module';

import { routing }       from './org-service-registry.routing';
import { OrgServiceRegistryComponent } from './org-service-registry.component';
import SpecificationsModule from "./specifications/specifications.module";
import DesignsModule from "./designs/designs.module";
import InstancesModule from "./instances/instances.module";
import SrHowToModule from "./sr-how-to/sr-how-to.module";
import {SpecificationXmlParser} from "./shared/services/specification-xml-parser.service";
import {DesignXmlParser} from "./shared/services/design-xml-parser.service";
import {InstanceXmlParser} from "./shared/services/instance-xml-parser.service";


@NgModule({
  imports: [
    CommonModule,
    NgaModule,
    SpecificationsModule,
    DesignsModule,
    InstancesModule,
	  SrHowToModule,
    routing
  ],
  declarations: [
    OrgServiceRegistryComponent
  ],
	providers: [
		SpecificationXmlParser,
		DesignXmlParser,
		InstanceXmlParser
	]
})
export default class OrgServiceRegistryModule {
}
