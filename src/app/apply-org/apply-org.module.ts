import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplyOrgComponent } from './apply-org.component';
import {NgaModule} from "../theme/nga.module";

@NgModule({
  imports: [
    CommonModule,
    NgaModule
  ],
  declarations: [ApplyOrgComponent]
})
export class ApplyOrgModule { }
