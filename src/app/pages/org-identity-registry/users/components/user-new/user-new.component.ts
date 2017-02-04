import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Organization} from "../../../../../backend-api/identity-registry/autogen/model/Organization";
import {NavigationHelperService} from "../../../../../shared/navigation-helper.service";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";
import {OrganizationsService} from "../../../../../backend-api/identity-registry/services/organizations.service";
import {FormGroup, FormBuilder, FormControl, Validators} from "@angular/forms";
import {MrnHelperService} from "../../../../../shared/mrn-helper.service";
import {McFormControlModel, McFormControlType} from "../../../../../theme/components/mcForm/mcFormControlModel";
import {UsersService} from "../../../../../backend-api/identity-registry/services/users.service";
import {User} from "../../../../../backend-api/identity-registry/autogen/model/User";
import {McUtils} from "../../../../../shared/mc-utils";


@Component({
  selector: 'user-new',
  encapsulation: ViewEncapsulation.None,
  template: require('./user-new.html'),
  styles: []
})
export class UserNewComponent implements OnInit {
  public organization: Organization;
	private mrn: string;
	private mrnMask:string;
	private mrnPattern:string;
	private mrnPatternError:string;
	// McForm params
	public isLoading = true;
	public isRegistering = false;
	public registerTitle = "Register User";
	public userForm: FormGroup;
	public formControlModels: Array<McFormControlModel>;

	constructor(private formBuilder: FormBuilder, private activatedRoute: ActivatedRoute, private navigationService: NavigationHelperService, private notifications: MCNotificationsService, private orgService: OrganizationsService, private usersService: UsersService, mrnHelper: MrnHelperService) {
		this.mrnMask = mrnHelper.mrnMaskForUser();
		this.mrnPattern = mrnHelper.mrnPattern();
		this.mrnPatternError = mrnHelper.mrnPatternError();
		this.mrn = this.mrnMask;
	}

	ngOnInit() {
		this.isRegistering = false;
		this.isLoading = true;
		this.loadMyOrganization();
	}

	public cancel() {
		this.navigationService.cancelCreateUser();
	}

	public register() {
		this.isRegistering = true;
		let user:User = {
			mrn: this.mrn,
			firstName: this.userForm.value.firstName,
			lastName: this.userForm.value.lastName,
			permissions: this.userForm.value.permissions,
			email: this.userForm.value.emails.email
		};

		this.createUser(user);
	}



	private createUser(user:User) {
		this.usersService.createUser(user).subscribe(
			user => {
				this.navigationService.navigateToUser(user.mrn);
				this.isRegistering = false;
			},
			err => {
				this.isRegistering = false;
				this.notifications.generateNotification('Error', 'Error when trying to create user', MCNotificationType.Error, err);
			}
		);
	}

	private loadMyOrganization() {
		this.orgService.getMyOrganization().subscribe(
			organization => {
				this.organization = organization;
				this.generateForm();
				this.isLoading = false;
			},
			err => {
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to get organization', MCNotificationType.Error, err);
			}
		);
	}

	private generateMRN(idValue:string) {
		var mrn = (idValue?idValue:'');
		let valueNoSpaces = mrn.split(' ').join('').toLowerCase();
		this.mrn = this.mrnMask + valueNoSpaces;
		this.userForm.patchValue({mrn: this.mrn});
	}

	private generateForm() {
		this.userForm = this.formBuilder.group({});
		this.formControlModels = [];

		var formControlModel:McFormControlModel = {formGroup: this.userForm, elementId: 'mrn', controlType: McFormControlType.Text, labelName: 'MRN', placeholder: '', isDisabled: true};
		var formControl = new FormControl(this.mrn, formControlModel.validator);
		this.userForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.userForm, elementId: 'userId', controlType: McFormControlType.Text, labelName: 'User ID', placeholder: 'Enter user ID to generate MRN', validator:Validators.required, pattern:this.mrnPattern, errorText:this.mrnPatternError};
		formControl = new FormControl('', formControlModel.validator);
		formControl.valueChanges.subscribe(param => this.generateMRN(param));
		this.userForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.userForm, elementId: 'firstName', controlType: McFormControlType.Text, labelName: 'First Name', placeholder: 'First Name is required', validator:Validators.required};
		formControl = new FormControl('', formControlModel.validator);
		this.userForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.userForm, elementId: 'lastName', controlType: McFormControlType.Text, labelName: 'Last Name', placeholder: 'Last Name is required', validator:Validators.required};
		formControl = new FormControl('', formControlModel.validator);
		this.userForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		McUtils.generateEmailConfirmGroup(this.formBuilder, this.userForm, this.formControlModels);

		formControlModel = {formGroup: this.userForm, elementId: 'permissions', controlType: McFormControlType.Text, labelName: 'Permissions', placeholder: ''};
		formControl = new FormControl('', formControlModel.validator);
		this.userForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);
	}
}
