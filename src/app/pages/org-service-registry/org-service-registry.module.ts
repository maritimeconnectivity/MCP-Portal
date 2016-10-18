import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { NgaModule } from '../../theme/nga.module';

import { routing }       from './org-service-registry.routing';
import { OrgServiceRegistryComponent } from './org-service-registry.component';
import SpecificationsModule from "./specifications/specifications.module";


@NgModule({
  imports: [
    CommonModule,
    NgaModule,
    SpecificationsModule,
    routing
  ],
  declarations: [
    OrgServiceRegistryComponent
  ]
})
export default class OrgServiceRegistryModule {
}
