import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgaModule } from '../../../theme/nga.module';
import { SharedModule } from '../../shared/shared.module';
import { ActingComponent } from './acting.component';
import { routing } from './acting.routing';
import { ActingListComponent } from './acting-list/acting-list.component';

@NgModule({
    imports: [
        CommonModule,
        NgaModule,
        SharedModule,
        routing
    ],
    declarations: [
        ActingComponent,
        ActingListComponent
    ]
})
export default class ActingModule {
}