import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { NgaModule } from '../../theme/nga.module';
import { OrganizationsComponent } from './organizations.component';
import { routing }       from './organizations.routing';
import {SharedModule} from "../shared/shared.module";
import {OrganizationListComponent} from "./components/organization-list/organization-list.component";
import {OrganizationDetailsComponent} from "./components/organization-details/organization-details.component";

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    NgaModule,
    routing
  ],
  declarations: [
    OrganizationsComponent,
	  OrganizationListComponent,
	  OrganizationDetailsComponent
  ]
})
export default class OrganizationsModule {}
