import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Role } from '../../../../../backend-api/identity-registry/autogen/model/Role';
import { EntityImageModel } from '../../../../../theme/components/mcEntityImage';
import { Organization } from '../../../../../backend-api/identity-registry/autogen/model/Organization';
import { AuthPermission, AuthService } from '../../../../../authentication/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationsService } from '../../../../../backend-api/identity-registry/services/organizations.service';
import { RolesService } from '../../../../../backend-api/identity-registry/services/roles.service';
import {
    MCNotificationsService,
    MCNotificationType
} from '../../../../../shared/mc-notifications.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'role-list',
    encapsulation: ViewEncapsulation.None,
    template: require('./role-list.html'),
    styles: []
})
export class RoleListComponent implements OnInit {
    private KEY_NEW = 'KEY_NEW_ROLE';
    private roles: Array<Role>;
    public entityImageList: Array<EntityImageModel>;
    public organization: Organization;
    public isLoading: boolean;

    constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute, private rolesService: RolesService, private orgService: OrganizationsService, private notifications: MCNotificationsService) {
    }

    ngOnInit() {
        this.isLoading = true;
        this.loadMyOrganization();
        this.loadRoles();
    }

    private loadMyOrganization() {
        this.orgService.getMyOrganization().subscribe(
            organization => {
                this.organization = organization;
            },
            err => {
                this.notifications.generateNotification('Error', 'Error when trying to get organization', MCNotificationType.Error, err);
            }
        )
    }

    private loadRoles() {
        this.rolesService.getOrgRoles(this.organization.mrn).subscribe(
            roles => {
                this.roles = roles;
                this.isLoading = false;
                this.generateEntityImageList();
            },
            err => {
                this.isLoading = false;
                this.notifications.generateNotification('Error', 'Error when trying to get roles', MCNotificationType.Error, err);
            }
        )
    }

    public gotoDetails(entityModel: EntityImageModel) {
        if (entityModel.entityId === this.KEY_NEW) {
            this.gotoCreate();
        } else {
            this.router.navigate([entityModel.entityId], {relativeTo: this.route});
        }
    }

    private gotoCreate() {
        this.router.navigate(['register'], {relativeTo: this.route});
    }

    private generateEntityImageList() {
        this.entityImageList = [];
        if (this.roles) {
            this.roles.forEach(role => {
               this.entityImageList.push({imageSourceObservable: this.createImgObservable(), entityId: role.id.toString(), title: role.permission});
            });
        }
        if (this.authService.authState.hasPermission(AuthPermission.OrgAdmin)) {
            this.entityImageList.push({imageSourceObservable: null, entityId: this.KEY_NEW, title: 'Register new Role', isAdd: true});
        }
    }

    private createImgObservable(): Observable<string> {
        let imageSrc = 'assets/img/no_service.svg';
        return Observable.create(observer => {
            observer.next(imageSrc);
        });
    }
}