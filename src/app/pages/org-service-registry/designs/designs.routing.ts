import { Routes, RouterModule }  from '@angular/router';
import {DesignsComponent} from "./designs.component";
import {DesignListComponent} from "./components/design-list/design-list.component";
import {DesignDetailsComponent} from "./components/design-details/design-details.component";
import {DesignNewComponent} from "./components/design-new/design-new.component";
import {DesignUpdateComponent} from "./components/design-update/design-update.component";

// noinspection TypeScriptValidateTypes
export const designRoutes: Routes = [
  {
    path: 'designs',
    component: DesignsComponent,
    data:{breadcrumb: 'Designs'},
    children: [
      {
        path: '',
        component: DesignListComponent
      },
      {
        path: 'register',
        component: DesignNewComponent,
        data:{breadcrumb: 'Register'}
      },
      {
        path: ':id',
        component: DesignDetailsComponent,
        data:{breadcrumb: 'Details'}
      },
	    {
		    path: 'update/:id',
		    component: DesignUpdateComponent,
		    data:{breadcrumb: 'Update'}
	    }
    ]
  }
];

export const routing = RouterModule.forChild(designRoutes);
