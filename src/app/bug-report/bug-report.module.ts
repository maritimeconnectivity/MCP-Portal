import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BugReportComponent } from './bug-report.component';
import {NgaModule} from "../theme/nga.module";

@NgModule({
  imports: [
    CommonModule,
    NgaModule
  ],
  declarations: [BugReportComponent]
})
export class BugReportModule { }
