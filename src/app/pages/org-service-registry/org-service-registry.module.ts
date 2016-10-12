import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { NgaModule } from '../../theme/nga.module';

import { routing }       from './org-service-registry.routing';
import { OrgServiceRegistryComponent } from './org-service-registry.component';
import { OrgSpecificationsComponent } from './components/org-specifications/org-specifications.component';


@NgModule({
  imports: [
    CommonModule,
    NgaModule,
    routing
  ],
  declarations: [
    OrgServiceRegistryComponent,
    OrgSpecificationsComponent
  ]
})
export default class OrgServiceRegistryModule {
}
