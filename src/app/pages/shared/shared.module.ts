import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import {DesignsTableComponent} from "./components/designs-table/designs-table.component";
import {SpecificationsTableComponent} from "./components/specifications-table/specifications-table.component";
import {NgaModule} from "../../theme/nga.module";
import {InstancesTableComponent} from "./components/instances-table/instances-table.component";


@NgModule({
  imports: [
    CommonModule,
    NgaModule
  ],
  declarations: [
    DesignsTableComponent,
    InstancesTableComponent,
    SpecificationsTableComponent
  ],
  exports: [
    DesignsTableComponent,
    InstancesTableComponent,
    SpecificationsTableComponent
  ]
})
export class SharedModule {
}
