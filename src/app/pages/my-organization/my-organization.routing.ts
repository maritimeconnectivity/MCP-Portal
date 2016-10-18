import { Routes, RouterModule }  from '@angular/router';

import { MyOrganization } from './my-organization.component';

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: MyOrganization,
    data:{breadcrumb: 'My Organization'},
    children: [
    ]
  }
];

export const routing = RouterModule.forChild(routes);
