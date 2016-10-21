import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import {DesignsTableComponent} from "./components/designs-table/designs-table.component";
import {SpecificationsTableComponent} from "./components/specifications-table/specifications-table.component";
import {NgaModule} from "../../theme/nga.module";


@NgModule({
  imports: [
    CommonModule,
    NgaModule
  ],
  declarations: [
    DesignsTableComponent,
    SpecificationsTableComponent
  ],
  exports: [
    DesignsTableComponent,
    SpecificationsTableComponent
  ]
})
export class SharedModule {
}
