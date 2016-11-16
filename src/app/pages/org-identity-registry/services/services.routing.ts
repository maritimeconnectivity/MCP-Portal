import { Routes, RouterModule }  from '@angular/router';
import {ServicesComponent} from "./services.component";
import {ServiceListComponent} from "./components/service-list/service-list.component";
import {ServiceDetailsComponent} from "./components/service-details/service-details.component";
import {ServiceNewComponent} from "./components/service-new/service-new.component";
import {CertificateIssueNewComponent} from "../../shared/components/certificate-issue-new/certificate-issue-new.component";

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: 'services',
    component: ServicesComponent,
    data:{breadcrumb: 'Services'},
    children: [
      {
        path: '',
        component: ServiceListComponent
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
		    component: ServiceNewComponent,
		    data:{breadcrumb: 'Register'}
	    },
      {
        path: ':id',
        component: ServiceDetailsComponent,
        data:{breadcrumb: 'Details'}
      }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
