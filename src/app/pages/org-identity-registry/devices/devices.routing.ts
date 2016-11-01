import { Routes, RouterModule }  from '@angular/router';
import {DevicesComponent} from "./devices.component";
import {DeviceListComponent} from "./components/device-list/device-list.component";
import {DeviceDetailsComponent} from "./components/device-details/device-details.component";

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: 'devices',
    component: DevicesComponent,
    data:{breadcrumb: 'Devices'},
    children: [
      {
        path: '',
        component: DeviceListComponent
      },
      {
        path: ':id',
        component: DeviceDetailsComponent,
        data:{breadcrumb: 'Details'}
      }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
