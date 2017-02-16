import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {OrganizationcontrollerApi} from "./autogen/api/OrganizationcontrollerApi";
import {RolecontrollerApi} from "./autogen/api/RolecontrollerApi";
import {ServicecontrollerApi} from "./autogen/api/ServicecontrollerApi";
import {DevicecontrollerApi} from "./autogen/api/DevicecontrollerApi";
import {UsercontrollerApi} from "./autogen/api/UsercontrollerApi";
import {VesselcontrollerApi} from "./autogen/api/VesselcontrollerApi";
import {LogocontrollerApi} from "./autogen/api/LogocontrollerApi";
import {Http} from "@angular/http";
import {BugReportControllerApi} from "./autogen/api/BugReportControllerApi";

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
  ],
  providers: [
	  {
		  provide: BugReportControllerApi,
		  useFactory: (http: Http) => {
			  return new BugReportControllerApi(http, IR_BASE_PATH);
		  },
		  deps: [Http]
	  },
	  {
		  provide: RolecontrollerApi,
		  useFactory: (http: Http) => {
			  return new RolecontrollerApi(http, IR_BASE_PATH, null);
		  },
		  deps: [Http]
	  },
	  {
		  provide: ServicecontrollerApi,
		  useFactory: (http: Http) => {
			  return new ServicecontrollerApi(http, IR_BASE_PATH, null);
		  },
		  deps: [Http]
	  },
	  {
		  provide: OrganizationcontrollerApi,
		  useFactory: (http: Http) => {
			  return new OrganizationcontrollerApi(http, IR_BASE_PATH, null);
		  },
		  deps: [Http]
	  },
	  {
		  provide: LogocontrollerApi,
		  useFactory: (http: Http) => {
			  return new LogocontrollerApi(http, IR_BASE_PATH, null);
		  },
		  deps: [Http]
	  },
	  {
		  provide: VesselcontrollerApi,
		  useFactory: (http: Http) => {
			  return new VesselcontrollerApi(http, IR_BASE_PATH, null);
		  },
		  deps: [Http]
	  },
	  {
		  provide: UsercontrollerApi,
		  useFactory: (http: Http) => {
			  return new UsercontrollerApi(http, IR_BASE_PATH, null);
		  },
		  deps: [Http]
	  },
	  {
		  provide: ServicecontrollerApi,
		  useFactory: (http: Http) => {
			  return new ServicecontrollerApi(http, IR_BASE_PATH, null);
		  },
		  deps: [Http]
	  },
	  {
		  provide: DevicecontrollerApi,
		  useFactory: (http: Http) => {
			  return new DevicecontrollerApi(http, IR_BASE_PATH, null);
		  },
		  deps: [Http]
	  }

  ]
})
export class IdentityRegistryApiModule { }
