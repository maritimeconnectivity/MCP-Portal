import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgaModule } from '../../../theme/nga.module';
import { SharedModule } from '../../shared/shared.module';
import { routing } from './agents.routing';
import { AgentsComponent } from './agents.component';
import { AgentListComponent } from './components/agent-list/agent-list.component';
import { AgentDetailsComponent } from './components/agent-details/agent-details.component';
import { AgentNewComponent } from './components/agent-new/agent-new.component';
import { AgentUpdateComponent } from './components/agent-update/agent-update.component';

@NgModule({
    imports: [
        CommonModule,
        NgaModule,
        SharedModule,
        routing
    ],
    declarations: [
        AgentsComponent,
        AgentListComponent,
        AgentDetailsComponent,
        AgentNewComponent,
        AgentUpdateComponent
    ]
})
export default class AgentsModule {
}