import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { NgaModule } from '../../theme/nga.module';

import { routing }       from './org-service-registry.routing';
import { OrgServiceRegistryComponent } from './org-service-registry.component';
import SpecificationsModule from "./specifications/specifications.module";
import DesignsModule from "./designs/designs.module";


@NgModule({
  imports: [
    CommonModule,
    NgaModule,
    SpecificationsModule,
    DesignsModule,
    routing
  ],
  declarations: [
    OrgServiceRegistryComponent
  ]
})
export default class OrgServiceRegistryModule {
}
