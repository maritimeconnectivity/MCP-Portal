import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';

import { routing }       from './services.routing';
import {ServicesComponent} from "./services.component";
import {ServiceListComponent} from "./components/service-list/service-list.component";
import {ServiceDetailsComponent} from "./components/service-details/service-details.component";
import {NgaModule} from "../../../theme/nga.module";
import {SharedModule} from "../../shared/shared.module";
import {ServiceNewComponent} from "./components/service-new/service-new.component";
import {ServiceUpdateComponent} from "./components/service-update/service-update.component";


@NgModule({
  imports: [
    CommonModule,
    NgaModule,
    SharedModule,
    routing
  ],
  declarations: [
    ServicesComponent,
    ServiceDetailsComponent,
    ServiceListComponent,
	  ServiceNewComponent,
	  ServiceUpdateComponent
  ],
	exports: [
		ServiceNewComponent,
		ServiceUpdateComponent
	]
})
export default class ServicesModule {
}
