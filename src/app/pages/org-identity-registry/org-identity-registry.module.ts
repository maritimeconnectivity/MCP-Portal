import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { NgaModule } from '../../theme/nga.module';

import { routing }       from './org-identity-registry.routing';
import { OrgIdentityRegistryComponent } from './org-identity-registry.component';
import { OrgDevicesComponent } from './components/org-devices/org-devices.component';
import {OrgServicesComponent} from "./components/org-services/org-services.component";


@NgModule({
  imports: [
    CommonModule,
    NgaModule,
    routing
  ],
  declarations: [
    OrgIdentityRegistryComponent,
    OrgDevicesComponent,
    OrgServicesComponent
  ]
})
export default class OrgIdentityRegistryModule {
}
