import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ServicespecificationresourceApi} from "./autogen/api/ServicespecificationresourceApi";
import {ServiceinstanceresourceApi} from "./autogen/api/ServiceinstanceresourceApi";
import {ApiHelperService} from "../shared/api-helper.service";
import {TechnicaldesignresourceApi} from "./autogen/api/TechnicaldesignresourceApi";

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [

  ],
  providers: [
    ApiHelperService,
    ServicespecificationresourceApi,
    ServiceinstanceresourceApi,
    TechnicaldesignresourceApi
  ]
})
export class ServiceRegistryModule { }
