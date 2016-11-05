import { Routes, RouterModule }  from '@angular/router';
import {OrganizationsComponent} from "./organizations.component";
import {OrganizationListComponent} from "./components/organization-list/organization-list.component";
import {OrganizationDetailsComponent} from "./components/organization-details/organization-details.component";

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: OrganizationsComponent,
    data:{breadcrumb: 'Organizations'},
    children: [
	    {
		    path: '',
		    component: OrganizationListComponent
	    },
	    {
		    path: ':id',
		    component: OrganizationDetailsComponent,
		    data:{breadcrumb: 'Details'},
	    }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
