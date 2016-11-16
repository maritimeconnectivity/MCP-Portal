import { Routes, RouterModule }  from '@angular/router';
import {UsersComponent} from "./users.component";
import {UserListComponent} from "./components/user-list/user-list.component";
import {UserDetailsComponent} from "./components/user-details/user-details.component";
import {CertificateIssueNewComponent} from "../../shared/components/certificate-issue-new/certificate-issue-new.component";
import {UserNewComponent} from "./components/user-new/user-new.component";

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: 'users',
    component: UsersComponent,
    data:{breadcrumb: 'Users'},
    children: [
      {
        path: '',
        component: UserListComponent
      },
	    {
		    path: 'issuecert',
		    component: CertificateIssueNewComponent,
		    data:{breadcrumb: 'New Certificate'},
		    children: [
		    ]
	    },
	    {
		    path: 'register',
		    component: UserNewComponent,
		    data:{breadcrumb: 'Register'}
	    },
      {
        path: ':id',
        component: UserDetailsComponent,
        data:{breadcrumb: 'Details'}
      }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
