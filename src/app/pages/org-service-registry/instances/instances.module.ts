import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';

import { routing }       from './instances.routing';
import {NgaModule} from "../../../theme/nga.module";
import {SharedModule} from "../../shared/shared.module";
import {InstancesComponent} from "./instances.component";
import {InstanceListComponent} from "./components/instance-list/instance-list.component";
import {InstanceDetailsComponent} from "./components/instance-details/instance-details.component";


@NgModule({
  imports: [
    CommonModule,
    NgaModule,
    SharedModule,
    routing
  ],
  declarations: [
    InstancesComponent,
    InstanceListComponent,
    InstanceDetailsComponent
  ]
})
export default class InstancesModule {
}
