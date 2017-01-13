import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import {routing} from "./my-organization.routing";
import {NgaModule} from "../../../../theme/nga.module";
import {SharedModule} from "../../../shared/shared.module";
import {MyOrganization} from "./my-organization.component";
import {MyOrganizationUpdateComponent} from "../my-organization-update/my-organization-update.component";

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    NgaModule,
    routing
  ],
  declarations: [
    MyOrganization,
	  MyOrganizationUpdateComponent
  ]
})
export default class MyOrganizationModule {}
