import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './instances.routing';
import { NgaModule } from "../../../theme/nga.module";
import { SharedModule } from "../../shared/shared.module";
import { InstancesComponent } from "./instances.component";
import { InstanceListComponent } from "./components/instance-list/instance-list.component";
import { InstanceDetailsComponent } from "./components/instance-details/instance-details.component";
import { InstanceNewComponent } from "./components/instance-new/instance-new.component";
import ServicesModule from "../../org-identity-registry/services/services.module";
import { InstanceUpdateComponent } from "./components/instance-update/instance-update.component";


@NgModule({
  imports: [
    CommonModule,
    NgaModule,
    SharedModule,
    routing,
	  ServicesModule
  ],
  declarations: [
    InstancesComponent,
    InstanceListComponent,
    InstanceDetailsComponent,
    InstanceNewComponent,
	  InstanceUpdateComponent
  ]
})
export default class InstancesModule {
}
