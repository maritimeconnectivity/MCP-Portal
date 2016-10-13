import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import {NgaModule} from "../theme/nga.module";

@NgModule({
  imports: [
    CommonModule,
    NgaModule
  ],
  declarations: [LoginComponent]
})
export class LoginModule { }
