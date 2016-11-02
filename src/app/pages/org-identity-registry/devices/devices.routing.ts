import { Routes, RouterModule }  from '@angular/router';
import {DevicesComponent} from "./devices.component";
import {DeviceListComponent} from "./components/device-list/device-list.component";
import {DeviceDetailsComponent} from "./components/device-details/device-details.component";
import {DeviceNewComponent} from "./components/device-new/device-new.component";
import {CertificateIssueNewComponent} from "../../shared/components/certificate-issue-new/certificate-issue-new.component";

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: 'devices',
    component: DevicesComponent,
    data:{breadcrumb: 'Devices'},
    children: [
      {
        path: '',
        component: DeviceListComponent
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
		    component: DeviceNewComponent,
		    data:{breadcrumb: 'Register'}
	    },
      {
        path: ':id',
        component: DeviceDetailsComponent,
        data:{breadcrumb: 'Details'}
      }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
