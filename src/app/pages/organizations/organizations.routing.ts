import { Routes, RouterModule }  from '@angular/router';
import {OrganizationsComponent} from "./organizations.component";

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: OrganizationsComponent,
    data:{breadcrumb: 'Organizations'},
    children: [
    ]
  }
];

export const routing = RouterModule.forChild(routes);
