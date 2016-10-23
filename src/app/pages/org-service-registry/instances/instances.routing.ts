import { Routes, RouterModule }  from '@angular/router';
import {InstancesComponent} from "./instances.component";
import {InstanceListComponent} from "./components/instance-list/instance-list.component";
import {InstanceDetailsComponent} from "./components/instance-details/instance-details.component";

// noinspection TypeScriptValidateTypes
export const routes: Routes = [
  {
    path: 'instances',
    component: InstancesComponent,
    data:{breadcrumb: 'Instances'},
    children: [
      {
        path: '',
        component: InstanceListComponent
      },
      {
        path: ':id',
        component: InstanceDetailsComponent,
        data:{breadcrumb: 'Details'}
      }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
