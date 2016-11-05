import { Routes, RouterModule }  from '@angular/router';
import {VesselsComponent} from "./vessels.component";
import {VesselListComponent} from "./components/vessel-list/vessel-list.component";
import {VesselDetailsComponent} from "./components/vessel-details/vessel-details.component";
import {VesselNewComponent} from "./components/vessel-new/vessel-new.component";
import {CertificateIssueNewComponent} from "../../shared/components/certificate-issue-new/certificate-issue-new.component";

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: 'vessels',
    component: VesselsComponent,
    data:{breadcrumb: 'Vessels'},
    children: [
      {
        path: '',
        component: VesselListComponent
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
		    component: VesselNewComponent,
		    data:{breadcrumb: 'Register'}
	    },
      {
        path: ':id',
        component: VesselDetailsComponent,
        data:{breadcrumb: 'Details'}
      }
    ]
  }
];

export const routing = RouterModule.forChild(routes);