import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';

import { routing }       from './specifications.routing';
import {SpecificationsComponent} from "./specifications.component";
import {SpecificationListComponent} from "./components/specification-list/specification-list.component";
import {SpecificationDetailsComponent} from "./components/specification-details/specification-details.component";
import {NgaModule} from "../../../theme/nga.module";


@NgModule({
  imports: [
    CommonModule,
    NgaModule,
    routing
  ],
  declarations: [
    SpecificationsComponent,
    SpecificationDetailsComponent,
    SpecificationListComponent
  ]
})
export default class SpecificationsModule {
}
