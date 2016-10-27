import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {OrganizationcontrollerApi} from "./autogen/api/OrganizationcontrollerApi";
import {RolecontrollerApi} from "./autogen/api/RolecontrollerApi";
import {ServicecontrollerApi} from "./autogen/api/ServicecontrollerApi";

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
  ],
  providers: [
    ServicecontrollerApi,
    OrganizationcontrollerApi,
    RolecontrollerApi
  ]
})
export class IdentityRegistryApiModule { }
