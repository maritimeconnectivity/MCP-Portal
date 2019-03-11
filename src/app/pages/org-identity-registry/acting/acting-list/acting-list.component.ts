import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AgentsService } from '../../../../backend-api/identity-registry/services/agents.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthPermission, AuthService } from '../../../../authentication/services/auth.service';
import { OrganizationsService } from '../../../../backend-api/identity-registry/services/organizations.service';
import {
    MCNotificationsService,
    MCNotificationType
} from '../../../../shared/mc-notifications.service';
import { Agent } from '../../../../backend-api/identity-registry/autogen/model/agent';
import { EntityImageModel } from '../../../../theme/components/mcEntityImage';
import { Organization } from '../../../../backend-api/identity-registry/autogen/model/Organization';
import { Observable } from 'rxjs';
import { LogoService } from '../../../../backend-api/identity-registry/services/logo.service';
import { ActingService } from '../../../../shared/acting.service';
import { NavigationHelperService } from '../../../../shared/navigation-helper.service';

@Component({
    selector: 'acting-list',
    encapsulation: ViewEncapsulation.None,
    template: require('./acting-list.html'),
    styles: []
})
export class ActingListComponent implements OnInit {

    private actingFor: Array<Agent>;
    private actingForOrgMrn: string;
    public entityImageList: Array<EntityImageModel>;
    public organization: Organization;
    public isLoading: boolean;
    public showModal: boolean = false;
    public modalDescription: string;

    constructor(private navigationService: NavigationHelperService, private actingService: ActingService, private agentsService: AgentsService, private router: Router, private authService: AuthService, private route: ActivatedRoute, private orgService: OrganizationsService, private notifications: MCNotificationsService, private logoService: LogoService) {
    }

    public ngOnInit() {
        this.isLoading = true;
        this.loadMyOrganization();
        this.loadActingFor();
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

    private loadActingFor() {
        this.agentsService.getActingOnBehalfOf().subscribe(actingForPage => {
           this.actingFor = actingForPage.content;
           this.isLoading = false;
           this.generateEntityImageList();
        });
    }

    public actOnBehalfOf(entityModel: EntityImageModel) {
        this.modalDescription = 'Do you want to act on behalf of ' + entityModel.title + '?';
        this.actingForOrgMrn = entityModel.entityId;
        this.showModal = true;
    }

    public actForSure() {
        this.actingService.actOnBehalfOf(this.actingForOrgMrn);
        this.navigationService.takeMeHome();
    }

    public cancelModal() {
        this.modalDescription = null;
        this.actingForOrgMrn = null;
        this.showModal = false;
    }

    private generateEntityImageList() {
        this.entityImageList = [];
        if (this.actingFor) {
            this.actingFor.forEach(agent => {
                this.orgService.getOrganizationById(agent.idOnBehalfOfOrganization).subscribe(org => {
                    this.entityImageList.push({imageSourceObservable: this.createImgObservable(org), entityId: org.mrn, title: org.name});
                });
            });
        }
    }

    private createImgObservable(organization: Organization): Observable<string> {
        let imageSrc = 'assets/img/no_organization.png';
        return Observable.create(observer => {
            this.logoService.getLogoForOrganization(organization.mrn).subscribe(
                logo => {
                    observer.next(URL.createObjectURL(new Blob([logo])));
                },
                err => {
                    observer.next(imageSrc);
                }
            );
        });
    }
}