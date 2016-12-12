import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ServicespecificationresourceApi} from "./autogen/api/ServicespecificationresourceApi";
import {ServiceinstanceresourceApi} from "./autogen/api/ServiceinstanceresourceApi";
import {TechnicaldesignresourceApi} from "./autogen/api/TechnicaldesignresourceApi";
import {XmlresourceApi} from "./autogen/api/XmlresourceApi";
import {DocresourceApi} from "./autogen/api/DocresourceApi";
import {Http} from "@angular/http";

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [

  ],
  providers: [
	  {
		  provide: ServicespecificationresourceApi,
		  useFactory: (http: Http) => {
			  return new ServicespecificationresourceApi(http, SR_BASE_PATH);
		  },
		  deps: [Http]
	  },
	  {
		  provide: ServiceinstanceresourceApi,
		  useFactory: (http: Http) => {
			  return new ServiceinstanceresourceApi(http, SR_BASE_PATH);
		  },
		  deps: [Http]
	  },
	  {
		  provide: TechnicaldesignresourceApi,
		  useFactory: (http: Http) => {
			  return new TechnicaldesignresourceApi(http, SR_BASE_PATH);
		  },
		  deps: [Http]
	  },
	  {
		  provide: XmlresourceApi,
		  useFactory: (http: Http) => {
			  return new XmlresourceApi(http, SR_BASE_PATH);
		  },
		  deps: [Http]
	  },
	  {
		  provide: DocresourceApi,
		  useFactory: (http: Http) => {
			  return new DocresourceApi(http, SR_BASE_PATH);
		  },
		  deps: [Http]
	  }
  ]
})
export class ServiceRegistryModule { }
