import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ServicespecificationresourceApi} from "./autogen/api/ServicespecificationresourceApi";
import {ServiceinstanceresourceApi} from "./autogen/api/ServiceinstanceresourceApi";
import {TechnicaldesignresourceApi} from "./autogen/api/TechnicaldesignresourceApi";

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [

  ],
  providers: [
    ServicespecificationresourceApi,
    ServiceinstanceresourceApi,
    TechnicaldesignresourceApi
  ]
})
export class ServiceRegistryModule { }
