import { RouterModule, Routes } from '@angular/router';
import { RolesComponent } from './roles.component';
import { RoleListComponent } from './components/role-list/role-list.component';
import { RoleNewComponent } from './components/role-new/role-new.component';
import { RoleDetailsComponent } from './components/role-details/role-details.component';
import { RoleUpdateComponent } from './components/role-update/role-update.component';

const routes: Routes = [
    {
        path: 'roles',
        component: RolesComponent,
        data: {breadcrumb: 'Roles'},
        children: [
            {
                path: '',
                component: RoleListComponent
            },
            {
                path: 'register',
                component: RoleNewComponent,
                data: {breadcrumb: 'Register'}
            },
            {
                path: ':id',
                component: RoleDetailsComponent,
                data: {breadcrumb: 'Details'}
            },
            {
                path: 'update/:id',
                component: RoleUpdateComponent,
                data: {breadcrumb: 'Update'}
            }
        ]
    }
];

export const routing = RouterModule.forChild(routes);
