import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './approve-organization.routing';
import { ApproveOrganizationComponent } from "./approve-organization.component";
import { NgaModule } from "../../../theme/nga.module";
import { SharedModule } from "../../shared/shared.module";
import { ApproveListComponent } from "./components/approve-list/approve-list.component";
import { ApproveDetailsComponent } from "./components/approve-details/approve-details.component";


@NgModule({
  imports: [
    CommonModule,
    NgaModule,
    SharedModule,
    routing
  ],
  declarations: [
    ApproveOrganizationComponent,
	  ApproveListComponent,
	  ApproveDetailsComponent
  ]
})
export default class ApproveOrganizationModule {
}
