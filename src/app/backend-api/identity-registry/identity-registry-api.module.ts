import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {OrganizationcontrollerApi} from "./autogen/api/OrganizationcontrollerApi";
import {RolecontrollerApi} from "./autogen/api/RolecontrollerApi";
import {ServicecontrollerApi} from "./autogen/api/ServicecontrollerApi";
import {DevicecontrollerApi} from "./autogen/api/DevicecontrollerApi";
import {UsercontrollerApi} from "./autogen/api/UsercontrollerApi";
import {VesselcontrollerApi} from "./autogen/api/VesselcontrollerApi";

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
  ],
  providers: [
    ServicecontrollerApi,
    OrganizationcontrollerApi,
    RolecontrollerApi,
    DevicecontrollerApi,
    ServicecontrollerApi,
    UsercontrollerApi,
    VesselcontrollerApi
  ]
})
export class IdentityRegistryApiModule { }
