import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './administration.routing';
import { AdministrationComponent } from './administration.component';
import { NgaModule } from "../../theme/nga.module";
import ApproveOrganizationModule from "./approve-organizations/approve-organization.module";


@NgModule({
  imports: [
    CommonModule,
    NgaModule,
	  ApproveOrganizationModule,
    routing
  ],
  declarations: [
    AdministrationComponent
  ]
})
export default class AdministrationModule {
}
