import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ServicespecificationresourceApi} from "./autogen/api/ServicespecificationresourceApi";
import {ServiceinstanceresourceApi} from "./autogen/api/ServiceinstanceresourceApi";
import {TechnicaldesignresourceApi} from "./autogen/api/TechnicaldesignresourceApi";
import {XmlresourceApi} from "./autogen/api/XmlresourceApi";
import {DocresourceApi} from "./autogen/api/DocresourceApi";

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [

  ],
  providers: [
    ServicespecificationresourceApi,
    ServiceinstanceresourceApi,
    TechnicaldesignresourceApi,
    XmlresourceApi,
    DocresourceApi
  ]
})
export class ServiceRegistryModule { }
