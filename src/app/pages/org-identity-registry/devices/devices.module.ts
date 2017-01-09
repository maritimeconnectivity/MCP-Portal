import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';

import { routing }       from './devices.routing';
import {DevicesComponent} from "./devices.component";
import {DeviceListComponent} from "./components/device-list/device-list.component";
import {DeviceDetailsComponent} from "./components/device-details/device-details.component";
import {NgaModule} from "../../../theme/nga.module";
import {SharedModule} from "../../shared/shared.module";
import {DeviceNewComponent} from "./components/device-new/device-new.component";
import {DeviceUpdateComponent} from "./components/device-update/device-update.component";


@NgModule({
  imports: [
    CommonModule,
    NgaModule,
    SharedModule,
    routing
  ],
  declarations: [
    DevicesComponent,
    DeviceDetailsComponent,
    DeviceListComponent,
	  DeviceNewComponent,
	  DeviceUpdateComponent
  ]
})
export default class DevicesModule {
}
