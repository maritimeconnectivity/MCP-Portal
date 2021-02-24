import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgaModule } from "../theme/nga.module";
import { AboutComponent } from "./about.component";

@NgModule({
  imports: [
    CommonModule,
    NgaModule
  ],
  declarations: [AboutComponent]
})
export class AboutModule { }
