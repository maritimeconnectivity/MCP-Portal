import { RouterModule, Routes } from '@angular/router';
import { ActingComponent } from './acting.component';
import { ActingListComponent } from './acting-list/acting-list.component';

const routes : Routes = [
    {
        path: 'acting',
        component: ActingComponent,
        data: {breadcrumb: 'Acting'},
        children: [
            {
                path: '',
                component: ActingListComponent
            }
        ]
    }
];

export const routing = RouterModule.forChild(routes);