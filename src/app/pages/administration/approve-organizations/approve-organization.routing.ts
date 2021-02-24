import { RouterModule, Routes } from '@angular/router';
import { ApproveOrganizationComponent } from "./approve-organization.component";
import { ApproveListComponent } from "./components/approve-list/approve-list.component";
import { ApproveDetailsComponent } from "./components/approve-details/approve-details.component";

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: 'approve',
	  component: ApproveOrganizationComponent,
	  data:{breadcrumb: 'Approve organizations'},
    children: [
      {
        path: '',
        component: ApproveListComponent
      },
	    {
		    path: ':id',
		    component: ApproveDetailsComponent,
		    data:{breadcrumb: 'Details'}
	    }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
