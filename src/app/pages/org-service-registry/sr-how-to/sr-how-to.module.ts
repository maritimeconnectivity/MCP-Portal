import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule } from '@angular/forms';
import {routing} from "./sr-how-to.routing";
import {SrHowToComponent} from "./sr-how-to.component";
import {SharedModule} from "../../shared/shared.module";
import {NgaModule} from "../../../theme/nga.module";

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    NgaModule,
    routing
  ],
  declarations: [
    SrHowToComponent
  ]
})
export default class SrHowToModule {}
