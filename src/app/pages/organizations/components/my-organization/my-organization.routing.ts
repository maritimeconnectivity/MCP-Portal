import { Routes, RouterModule }  from '@angular/router';
import {MyOrganization} from "./my-organization.component";
import {CertificateIssueNewComponent} from "../../../shared/components/certificate-issue-new/certificate-issue-new.component";

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: MyOrganization,
    data:{breadcrumb: 'My Organization'},
    children: [
    ]
  },
  {
    path: 'issuecert',
    component: CertificateIssueNewComponent,
    data:{breadcrumb: 'New Certificate'},
    children: [
    ]
  }
];

export const routing = RouterModule.forChild(routes);
