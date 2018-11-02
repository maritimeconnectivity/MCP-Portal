import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AgentsService } from '../../../../../backend-api/identity-registry/services/agents.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthPermission, AuthService } from '../../../../../authentication/services/auth.service';
import { OrganizationsService } from '../../../../../backend-api/identity-registry/services/organizations.service';
import {
    MCNotificationsService,
    MCNotificationType
} from '../../../../../shared/mc-notifications.service';
import { Agent } from '../../../../../backend-api/identity-registry/autogen/model/agent';
import { EntityImageModel } from '../../../../../theme/components/mcEntityImage';
import { Organization } from '../../../../../backend-api/identity-registry/autogen/model/Organization';
import { Observable } from 'rxjs';

@Component({
    selector: 'agent-list',
    encapsulation: ViewEncapsulation.None,
    template: require('./agent-list.html'),
    styles: []
})
export class AgentListComponent implements OnInit {
    private KEY_NEW = 'KEY_NEW_AGENT';
    private agents: Array<Agent>;
    public entityImageList: Array<EntityImageModel>;
    public organization: Organization;
    public isLoading: boolean;

    constructor(private agentsService: AgentsService, private router: Router, private authService: AuthService, private route: ActivatedRoute, private orgService: OrganizationsService, private notifications: MCNotificationsService) {
    }

    ngOnInit() {
        this.isLoading = true;
        this.loadMyOrganization();
        this.loadAgents();
    }

    private loadMyOrganization() {
        this.orgService.getMyOrganization().subscribe(
            organization => {
                this.organization = organization;
            },
            err => {
                this.notifications.generateNotification('Error', 'Error when trying to get organization', MCNotificationType.Error, err);
            }
        );
    }

    private loadAgents() {
        this.agentsService.getAgents().subscribe(
            agents => {
                this.agents = agents.content;
                this.isLoading = false;
                this.generateEntityImageList();
            }
        );
    }

    private generateEntityImageList() {
        this.entityImageList = [];
        if (this.agents) {
            this.agents.forEach(agent => {
                this.orgService.getOrganizationById(agent.idActingOrganization).subscribe(org => {
                    this.entityImageList.push({imageSourceObservable: this.createImgObservable(), entityId: agent.id.toString(), title: org.name});
                });
            });
        }
        if (this.authService.authState.hasPermission(AuthPermission.OrgAdmin)) {
            this.entityImageList.push({imageSourceObservable: null, entityId: this.KEY_NEW, title: 'Register new Agent', isAdd: true});
        }
    }

    private createImgObservable(): Observable<string> {
        let imageSrc = 'assets/img/no_user.png';
        return Observable.create(observer => {
            observer.next(imageSrc);
        });
    }
}