import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgaModule } from '../../../theme/nga.module';
import { SharedModule } from '../../shared/shared.module';
import { routing } from './roles.routing';
import { RolesComponent } from './roles.component';
import { RoleListComponent } from './components/role-list/role-list.component';
import { RoleNewComponent } from './components/role-new/role-new.component';
import { RoleDetailsComponent } from './components/role-details/role-details.component';
import { RoleUpdateComponent } from './components/role-update/role-update.component';

@NgModule({
    imports: [
        CommonModule,
        NgaModule,
        SharedModule,
        routing
    ],
    declarations: [
        RolesComponent,
        RoleListComponent,
        RoleNewComponent,
        RoleDetailsComponent,
        RoleUpdateComponent
    ]
})
export default class RolesModule {
}
