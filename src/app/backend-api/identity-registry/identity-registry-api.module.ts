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
import {VesselimagecontrollerApi} from "./autogen/api/VesselimagecontrollerApi";
import { AgentControllerService } from './autogen/api/agentController.service';
import { AppConfig } from '../../app.config';

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
			return new BugReportControllerApi(http, AppConfig.IR_BASE_PATH);
		},
		  deps: [Http]
	  },
	  {
		  provide: RolecontrollerApi,
		  useFactory: (http: Http) => {
			  return new RolecontrollerApi(http, AppConfig.IR_BASE_PATH, null);
		  },
		  deps: [Http]
	  },
	  {
		  provide: ServicecontrollerApi,
		  useFactory: (http: Http) => {
			  return new ServicecontrollerApi(http, AppConfig.IR_BASE_PATH, null);
		  },
		  deps: [Http]
	  },
	  {
		  provide: OrganizationcontrollerApi,
		  useFactory: (http: Http) => {
			  return new OrganizationcontrollerApi(http, AppConfig.IR_BASE_PATH, null);
		  },
		  deps: [Http]
	  },
	  {
		  provide: LogocontrollerApi,
		  useFactory: (http: Http) => {
			  return new LogocontrollerApi(http, AppConfig.IR_BASE_PATH, null);
		  },
		  deps: [Http]
	  },
	  {
		  provide: VesselcontrollerApi,
		  useFactory: (http: Http) => {
			  return new VesselcontrollerApi(http, AppConfig.IR_BASE_PATH, null);
		  },
		  deps: [Http]
	  },
	  {
		  provide: UsercontrollerApi,
		  useFactory: (http: Http) => {
			  return new UsercontrollerApi(http, AppConfig.IR_BASE_PATH, null);
		  },
		  deps: [Http]
	  },
	  {
		  provide: ServicecontrollerApi,
		  useFactory: (http: Http) => {
			  return new ServicecontrollerApi(http, AppConfig.IR_BASE_PATH, null);
		  },
		  deps: [Http]
	  },
	  {
		  provide: DevicecontrollerApi,
		  useFactory: (http: Http) => {
			  return new DevicecontrollerApi(http, AppConfig.IR_BASE_PATH, null);
		  },
		  deps: [Http]
	  },
	  {
		  provide: VesselimagecontrollerApi,
		  useFactory: (http: Http) => {
			  return new VesselimagecontrollerApi(http, AppConfig.IR_BASE_PATH, null);
		  },
		  deps: [Http]
	  },
	  {
		  provide: AgentControllerService,
		  useFactory: (http: Http) => {
			return new AgentControllerService(http, AppConfig.IR_BASE_PATH, null);
		  },
		  deps: [Http]
	  }
  ]
})
export class IdentityRegistryApiModule { }
