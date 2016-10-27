import { Routes, RouterModule }  from '@angular/router';
import {InstancesComponent} from "./instances.component";
import {InstanceListComponent} from "./components/instance-list/instance-list.component";
import {InstanceDetailsComponent} from "./components/instance-details/instance-details.component";
import {InstanceNewComponent} from "./components/instance-new/instance-new.component";

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
        path: 'register',
        component: InstanceNewComponent,
        data:{breadcrumb: 'Register'}
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
