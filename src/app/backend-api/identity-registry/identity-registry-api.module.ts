import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {OrganizationcontrollerApi} from "./autogen/api/OrganizationcontrollerApi";
import {ApiHelperService} from "../shared/api-helper.service";

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
  ],
  providers: [
    ApiHelperService,
    OrganizationcontrollerApi
  ]
})
export class IdentityRegistryApiModule { }
