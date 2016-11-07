import { Component, ViewEncapsulation } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";
import {Organization} from "../../../../../backend-api/identity-registry/autogen/model/Organization";
import {OrganizationsService} from "../../../../../backend-api/identity-registry/services/organizations.service";
import {McFormControlModel} from "../../../../../theme/components/mcFormControl/mcFormControl.component";
import {FormGroup, FormBuilder, FormControl, Validators} from "@angular/forms";
import {MrnHelperService} from "../../../../../shared/mrn-helper.service";
import {McUtils} from "../../../../../shared/mc-utils";
import {User} from "../../../../../backend-api/identity-registry/autogen/model/User";
import {MC_ADMIN} from "../../../../../shared/app.constants";
import {UsersService} from "../../../../../backend-api/identity-registry/services/users.service";
import {RolesService} from "../../../../../backend-api/identity-registry/services/roles.service";
import {Role} from "../../../../../backend-api/identity-registry/autogen/model/Role";
import RoleNameEnum = Role.RoleNameEnum;

@Component({
  selector: 'approve-details',
  encapsulation: ViewEncapsulation.None,
  template: require('./approve-details.html'),
	styles: [require('./approve-details.scss')]
})
export class ApproveDetailsComponent {
	private userMrn: string;
	private mrnPattern:string;
	private mrnPatternError:string;
	// McForm params
	public isApproving = false;
	public approveTitle = "Approve";
	public userForm: FormGroup;
	public formControlModels: Array<McFormControlModel>;


	public organization:Organization;
	public title:string;
	public isLoading:boolean;
  constructor(private route: ActivatedRoute, private router: Router, private notifications:MCNotificationsService, private userService: UsersService, private roleService: RolesService, private orgService: OrganizationsService, private formBuilder: FormBuilder, private mrnHelper: MrnHelperService) {
	  this.mrnPattern = mrnHelper.mrnPattern();
	  this.mrnPatternError = mrnHelper.mrnPatternError();
  }

  ngOnInit() {
	  this.title = 'Approve organization';
	  this.loadOrganization();
  }

  public approve() {
	  this.isApproving = true;
	  this.approveOrganization();
  }

  public cancel() {
	  this.router.navigate(['../'], {relativeTo: this.route });
  }

	private loadOrganization() {
		this.isLoading = true;
		let orgMrn = this.route.snapshot.params['id'];

		this.orgService.getUnapprovedOrganization(orgMrn).subscribe(
		 organization => {
				this.organization = organization;
			 this.userMrn = this.mrnHelper.mrnMaskForUserOfOrg(organization.mrn);
			 this.generateForm();
			 this.isLoading = false;
			},
			err => {
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to get the organization', MCNotificationType.Error, err);
				this.router.navigate(['../'], {relativeTo: this.route });
			}
		);
	}


	private approveOrganization() {
		this.orgService.approveOrganization(this.organization.mrn).subscribe(
			organization => {
				this.createAdminRole();
			},
			err => {
				this.isApproving = false;
				this.notifications.generateNotification('Error', 'Error when trying to approve the organization', MCNotificationType.Error, err);
			}
		);
	}

	private createAdminRole() {
		let role:Role = {};
		role.permission = MC_ADMIN;
		role.roleName = RoleNameEnum.ROLE_ORG_ADMIN;

		this.roleService.createRole(this.organization.mrn, role).subscribe(
			role => {
				this.createUser();
			},
			err => {
				this.isApproving = false;
				this.notifications.generateNotification('User not created', 'The organization was approved, but user creation failed. You can go to organizations and try to create the user again later.', MCNotificationType.Alert, err);
				this.router.navigate(['../'], {relativeTo: this.route });
			}
		);
	}

	private createUser() {
		let user:User = {};
		user.mrn = this.userMrn;
		user.firstName= this.userForm.value.firstName;
		user.lastName= this.userForm.value.lastName;
		user.permissions = MC_ADMIN;
		user.email = this.userForm.value.emails.email;

		this.userService.createUser(this.organization.mrn, user).subscribe(
			user => {
				this.isApproving = false;
				this.notifications.generateNotification('Organization Approved', 'The organization was approved and now has access to the Maritime Cloud', MCNotificationType.Success);
				this.router.navigate(['../'], {relativeTo: this.route });
			},
			err => {
				this.isApproving = false;
				this.notifications.generateNotification('User not created', 'The organization was approved, but user creation failed. You can go to organizations and try to create the user again later.', MCNotificationType.Alert, err);
				this.router.navigate(['../'], {relativeTo: this.route });
			}
		);
	}

	private generateMRN(idValue:string) {
		var mrn = (idValue?idValue:'');
		let valueNoSpaces = mrn.split(' ').join('').toLowerCase();
		this.userMrn = this.mrnHelper.mrnMaskForUserOfOrg(this.organization.mrn) + valueNoSpaces;
		this.userForm.patchValue({mrn: this.userMrn});
	}
/*
 {
 "mrn":"urn:mrn:mcl:user:dma:dma-employee",
 "firstName":"Dma",
 "lastName": "Employee",
 "email" : "dma-employee@dma.dk",
 "permissions": "MCADMIN"
 }
 */
	private generateForm() {
		this.userForm = this.formBuilder.group({});
		this.formControlModels = [];

		var formControlModel:McFormControlModel = {formGroup: this.userForm, elementId: 'mrn', inputType: 'text', labelName: 'MRN', placeholder: '', isDisabled: true};
		var formControl = new FormControl(this.userMrn, formControlModel.validator);
		this.userForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.userForm, elementId: 'userId', inputType: 'text', labelName: 'User ID', placeholder: 'Enter user ID to generate MRN', validator:Validators.required, pattern:this.mrnPattern, errorText:this.mrnPatternError};
		formControl = new FormControl('', formControlModel.validator);
		formControl.valueChanges.subscribe(param => this.generateMRN(param));
		this.userForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.userForm, elementId: 'firstName', inputType: 'text', labelName: 'First Name', placeholder: 'First Name is required', validator:Validators.required};
		formControl = new FormControl('', formControlModel.validator);
		this.userForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.userForm, elementId: 'lastName', inputType: 'text', labelName: 'Last Name', placeholder: 'Last Name is required', validator:Validators.required};
		formControl = new FormControl('', formControlModel.validator);
		this.userForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		McUtils.generateEmailConfirmGroup(this.formBuilder, this.userForm, this.formControlModels);
	}
}
