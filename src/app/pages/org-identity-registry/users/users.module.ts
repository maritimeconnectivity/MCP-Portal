import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';

import { routing }       from './users.routing';
import {UsersComponent} from "./users.component";
import {UserListComponent} from "./components/user-list/user-list.component";
import {UserDetailsComponent} from "./components/user-details/user-details.component";
import {NgaModule} from "../../../theme/nga.module";
import {SharedModule} from "../../shared/shared.module";
import {UserNewComponent} from "./components/user-new/user-new.component";
import {UserUpdateComponent} from "./components/user-update/user-update.component";


@NgModule({
  imports: [
    CommonModule,
    NgaModule,
    SharedModule,
    routing
  ],
  declarations: [
    UsersComponent,
    UserDetailsComponent,
    UserListComponent,
	  UserNewComponent,
	  UserUpdateComponent
  ]
})
export default class UsersModule {
}
