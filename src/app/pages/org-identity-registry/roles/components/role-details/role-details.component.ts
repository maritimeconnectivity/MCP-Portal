import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService } from '../../../../../authentication/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RolesService } from '../../../../../backend-api/identity-registry/services/roles.service';
import {
    MCNotificationsService,
    MCNotificationType
} from '../../../../../shared/mc-notifications.service';
import { NavigationHelperService } from '../../../../../shared/navigation-helper.service';
import { LabelValueModel } from '../../../../../theme/components/mcLabelValueTable';
import { Role } from '../../../../../backend-api/identity-registry/autogen/model/Role';
import { Organization } from '../../../../../backend-api/identity-registry/autogen/model/Organization';
import { OrganizationsService } from '../../../../../backend-api/identity-registry/services/organizations.service';
import { RoleViewModel } from '../../view-models/RoleViewModel';

@Component({
    selector: 'role-details',
    encapsulation: ViewEncapsulation.None,
    template: require('./role-details.html'),
    styles: []
})
export class RoleDetailsComponent implements OnInit{
    private organization: Organization;

    public labelValues: Array<LabelValueModel>;
    public title: string;
    public isLoading: boolean;
    public role: Role;
    public showModal: boolean = false;
    public modalDescription: string;

    constructor(private authService: AuthService, private orgService: OrganizationsService, private route: ActivatedRoute, private router: Router, private rolesService: RolesService, private notifications: MCNotificationsService, private navigationHelper: NavigationHelperService) {
    }

    ngOnInit() {
        this.isLoading = true;
        this.loadMyOrganization();
    }

    private loadRole() {
        let id = this.route.snapshot.params['id'];
        this.rolesService.getRole(this.organization.mrn, id).subscribe(role => {
           this.role = role;
           this.title = role.permission;
           this.isLoading = false;
           this.generateLabelValues();
        }, err => {
            this.isLoading = false;
            this.notifications.generateNotification('Error', 'Error when trying to get role', MCNotificationType.Error, err);
        });
    }

    private loadMyOrganization() {
        this.orgService.getMyOrganization().subscribe(organization => {
            this.organization = organization;
            this.loadRole();
        },
            err => {
                this.isLoading = false;
                this.notifications.generateNotification('Error', 'Error when trying to get organization', MCNotificationType.Error, err);
            });
    }

    private generateLabelValues() {
        this.labelValues = [];
        if (this.role) {
            this.labelValues.push({label: 'Permission Name', valueHtml: this.role.permission});
            this.labelValues.push({label: 'Role Name', valueHtml: RoleViewModel.getLabelForEnum(this.role.roleName)});
        }
    }

    private showDelete(): boolean {
        return this.isAdmin() && this.role != null;
    }

    private showUpdate(): boolean {
        return this.isAdmin() && this.role != null;
    }

    private isAdmin(): boolean {
        return this.authService.authState.isAdmin();
    }

    public delete() {
        this.modalDescription = 'Are you sure you want to delete this role?';
        this.showModal = true;
    }

    public deleteForSure() {
        this.isLoading = true;
        this.showModal = false;
        this.rolesService.deleteRole(this.organization.mrn, this.role.id).subscribe(() => {
            this.router.navigate(['../'], {relativeTo: this.route});
        }, err => {
            this.isLoading = false;
            this.notifications.generateNotification('Error', 'Error when trying to delete role', MCNotificationType.Error, err);
        });
    }

    public cancelModal() {
        this.showModal = false;
    }

    public update() {
        this.navigationHelper.navigateToUpdateRole(this.role.id);
    }
}