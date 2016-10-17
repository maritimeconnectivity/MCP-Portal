import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {OrganizationcontrollerApi} from "./autogen/api/OrganizationcontrollerApi";
import {ApiHelperService} from "../shared/api-helper.service";
import {RolecontrollerApi} from "./autogen/api/RolecontrollerApi";

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
  ],
  providers: [

    OrganizationcontrollerApi,
    RolecontrollerApi
  ]
})
export class IdentityRegistryApiModule { }
