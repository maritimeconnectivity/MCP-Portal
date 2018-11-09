import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { NgaModule } from '../../theme/nga.module';

import { routing }       from './org-identity-registry.routing';
import { OrgIdentityRegistryComponent } from './org-identity-registry.component';
import VesselsModule from "./vessels/vessels.module";
import DevicesModule from "./devices/devices.module";
import UsersModule from "./users/users.module";
import ServicesModule from "./services/services.module";
import RolesModule from './roles/roles.module';
import AgentsModule from './agents/agents.module';
import ActingModule from './acting/acting.module';


@NgModule({
  imports: [
    CommonModule,
    NgaModule,
	  VesselsModule,
	  DevicesModule,
	  ServicesModule,
	  UsersModule,
      RolesModule,
      AgentsModule,
      ActingModule,
    routing
  ],
  declarations: [
    OrgIdentityRegistryComponent
  ]
})
export default class OrgIdentityRegistryModule {
}
