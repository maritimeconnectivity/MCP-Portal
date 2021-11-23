import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ServicespecificationresourceApi} from "./autogen/api/ServicespecificationresourceApi";
import {ServiceinstanceresourceApi} from "./autogen/api/ServiceinstanceresourceApi";
import {TechnicaldesignresourceApi} from "./autogen/api/TechnicaldesignresourceApi";
import {XmlresourceApi} from "./autogen/api/XmlresourceApi";
import {DocresourceApi} from "./autogen/api/DocresourceApi";
import {Http} from "@angular/http";
import {XsdresourceApi} from "./autogen/api/XsdresourceApi";
import {InstanceXmlParser} from "../../pages/org-service-registry/shared/services/instance-xml-parser.service";
import {DesignXmlParser} from "../../pages/org-service-registry/shared/services/design-xml-parser.service";
import {SpecificationXmlParser} from "../../pages/org-service-registry/shared/services/specification-xml-parser.service";
import { AppConfig } from '../../app.config';

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
			  return new ServicespecificationresourceApi(http, AppConfig.SR_BASE_PATH, null);
		  },
		  deps: [Http]
	  },
	  {
		  provide: ServiceinstanceresourceApi,
		  useFactory: (http: Http) => {
			  return new ServiceinstanceresourceApi(http, AppConfig.SR_BASE_PATH, null);
		  },
		  deps: [Http]
	  },
	  {
		  provide: TechnicaldesignresourceApi,
		  useFactory: (http: Http) => {
			  return new TechnicaldesignresourceApi(http, AppConfig.SR_BASE_PATH, null);
		  },
		  deps: [Http]
	  },
	  {
		  provide: XmlresourceApi,
		  useFactory: (http: Http) => {
			  return new XmlresourceApi(http, AppConfig.SR_BASE_PATH, null);
		  },
		  deps: [Http]
	  },
	  {
		  provide: DocresourceApi,
		  useFactory: (http: Http) => {
			  return new DocresourceApi(http, AppConfig.SR_BASE_PATH, null);
		  },
		  deps: [Http]
	  },
	  {
		  provide: XsdresourceApi,
		  useFactory: (http: Http) => {
			  return new XsdresourceApi(http, AppConfig.SR_BASE_PATH, null);
		  },
		  deps: [Http]
	  },
	  SpecificationXmlParser,
	  DesignXmlParser,
	  InstanceXmlParser
  ]
})
export class ServiceRegistryApiModule { }
