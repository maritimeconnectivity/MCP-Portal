import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ServicespecificationresourceApi} from "./autogen/api/ServicespecificationresourceApi";
import {ServiceinstanceresourceApi} from "./autogen/api/ServiceinstanceresourceApi";
import {ApiHelperService} from "../shared/api-helper.service";

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [

  ],
  providers: [
    ApiHelperService,
    ServicespecificationresourceApi,
    ServiceinstanceresourceApi
  ]
})
export class ServiceRegistryModule { }
