import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { NgaModule } from '../../theme/nga.module';

import { routing }       from './org-identity-registry.routing';
import { OrgIdentityRegistryComponent } from './org-identity-registry.component';
import VesselsModule from "./vessels/vessels.module";


@NgModule({
  imports: [
    CommonModule,
    NgaModule,
	  VesselsModule,
    routing
  ],
  declarations: [
    OrgIdentityRegistryComponent
  ]
})
export default class OrgIdentityRegistryModule {
}
