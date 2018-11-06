import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Organization } from '../../../../../backend-api/identity-registry/autogen/model/Organization';
import { LabelValueModel } from '../../../../../theme/components/mcLabelValueTable';
import { Agent } from '../../../../../backend-api/identity-registry/autogen/model/agent';
import { AuthPermission, AuthService } from '../../../../../authentication/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AgentsService } from '../../../../../backend-api/identity-registry/services/agents.service';
import { OrganizationsService } from '../../../../../backend-api/identity-registry/services/organizations.service';
import { NavigationHelperService } from '../../../../../shared/navigation-helper.service';
import {
    MCNotificationsService,
    MCNotificationType
} from '../../../../../shared/mc-notifications.service';

@Component({
    selector: 'agent-details',
    encapsulation: ViewEncapsulation.None,
    template: require('./agent-details.html'),
    styles: []
})
export class AgentDetailsComponent implements OnInit {
    private organization: Organization;
    public labelValues: Array<LabelValueModel>;
    public title: string;
    public isLoading: boolean;
    public agent: Agent;
    public showModal: boolean = false;
    public modalDescription: string;

    constructor(private authService: AuthService, private route: ActivatedRoute, private router: Router, private agentsService: AgentsService, private organizationService: OrganizationsService, private notifications: MCNotificationsService, private navigationHelper: NavigationHelperService) {
    }

    ngOnInit() {
        this.isLoading = true;
        this.loadOrganization();
        this.loadAgent();
    }

    private loadOrganization() {
        this.organizationService.getMyOrganization().subscribe(org => {
           this.organization = org;
        });
    }

    private loadAgent() {
        let id = this.route.snapshot.params['id'];
        this.agentsService.getAgent(id).subscribe(agent => {
           this.agent = agent;
           this.organizationService.getOrganizationById(agent.idActingOrganization).subscribe(org => {
              this.title = org.name;
              this.isLoading = false;
              this.generateLabelValues();
           },
               err => {
                   this.isLoading = false;
                   this.notifications.generateNotification('Error', 'Error when trying to get the name of organization', MCNotificationType.Error, err);
               });
        },
            err => {
                this.isLoading = false;
                this.notifications.generateNotification('Error', 'Error when trying to get agent', MCNotificationType.Error, err);
            });
    }

    private generateLabelValues() {
        this.labelValues = [];
        if (this.agent) {
            this.labelValues.push({label: 'Agent Organization', valueHtml: this.title});
        }
    }

    public showUpdate(): boolean {
        return this.isAdmin() && this.agent != null;
    }

    public showDelete(): boolean {
        return this.isAdmin() && this.agent != null;
    }

    private isAdmin(): boolean {
        return this.authService.authState.hasPermission(AuthPermission.OrgAdmin);
    }

    public delete() {
        this.modalDescription = 'Are you sure you want to delete the agent?';
        this.showModal = true;
    }

    public cancelModal() {
        this.showModal = false;
    }

    public deleteForSure() {
        this.isLoading = true;
        this.showModal = false;
        this.agentsService.deleteAgent(this.agent.id).subscribe(() => {
            this.router.navigate(['../'], {relativeTo: this.route});
        },
            err => {
                this.isLoading = false;
                this.notifications.generateNotification('Error', 'Error when trying to delete the agent', MCNotificationType.Error, err);
            });
    }
}