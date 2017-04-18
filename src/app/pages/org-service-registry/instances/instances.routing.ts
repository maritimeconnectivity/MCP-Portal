import { Routes, RouterModule }  from '@angular/router';
import {InstancesComponent} from "./instances.component";
import {InstanceListComponent} from "./components/instance-list/instance-list.component";
import {InstanceDetailsComponent} from "./components/instance-details/instance-details.component";
import {InstanceNewComponent} from "./components/instance-new/instance-new.component";
import {ServiceNewComponent} from "../../org-identity-registry/services/components/service-new/service-new.component";
import {CertificateIssueNewComponent} from "../../shared/components/certificate-issue-new/certificate-issue-new.component";
import {ServiceUpdateComponent} from "../../org-identity-registry/services/components/service-update/service-update.component";
import {CertificateRevokeComponent} from "../../shared/components/certificate-revoke/certificate-revoke.component";
import {InstanceUpdateComponent} from "./components/instance-update/instance-update.component";

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
		    path: 'issuecert',
		    component: CertificateIssueNewComponent,
		    data:{breadcrumb: 'New Certificate'},
		    children: [
		    ]
	    },
	    {
		    path: 'revokecert',
		    component: CertificateRevokeComponent,
		    data:{breadcrumb: 'Revoke Certificate'},
		    children: [
		    ]
	    },
	    {
		    path: 'register',
		    component: InstanceNewComponent,
		    data:{breadcrumb: 'Register'}
	    },
	    {
		    path: 'register-id',
		    component: ServiceNewComponent,
		    data:{breadcrumb: 'Register ID'}
	    },
      {
        path: ':id',
        component: InstanceDetailsComponent,
        data:{breadcrumb: 'Details'}
      },
	    {
		    path: 'update-id/:id',
		    component: ServiceUpdateComponent,
		    data:{breadcrumb: 'Update ID'}
	    },
	    {
		    path: 'update/:id',
		    component: InstanceUpdateComponent,
		    data:{breadcrumb: 'Update'}
	    }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
