import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { NgaModule } from '../../theme/nga.module';

import { routing }       from './org-identity-registry.routing';
import { OrgIdentityRegistryComponent } from './org-identity-registry.component';
import VesselsModule from "./vessels/vessels.module";
import DevicesModule from "./devices/devices.module";
import UsersModule from "./users/users.module";


@NgModule({
  imports: [
    CommonModule,
    NgaModule,
	  VesselsModule,
	  DevicesModule,
	  UsersModule,
    routing
  ],
  declarations: [
    OrgIdentityRegistryComponent
  ]
})
export default class OrgIdentityRegistryModule {
}
