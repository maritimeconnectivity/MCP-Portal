import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {Organization} from "../../../../backend-api/identity-registry/autogen/model/Organization";
import {FormGroup, FormBuilder, FormControl, Validators} from "@angular/forms";
import {McFormControlModel, McFormControlType} from "../../../../theme/components/mcForm/mcFormControlModel";
import {NavigationHelperService} from "../../../../shared/navigation-helper.service";
import {MCNotificationsService, MCNotificationType} from "../../../../shared/mc-notifications.service";
import {OrganizationsService} from "../../../../backend-api/identity-registry/services/organizations.service";
import {McUtils} from "../../../../shared/mc-utils";
import {UrlValidator} from "../../../../theme/validators/url.validator";


@Component({
  selector: 'organization-update',
  encapsulation: ViewEncapsulation.None,
  template: require('./my-organization-update.html'),
  styles: []
})
export class MyOrganizationUpdateComponent implements OnInit {
	public organization: Organization;
	// McForm params
	public isLoading = true;
	public isUpdating = false;
	public updateTitle = "Update organization";
	public updateForm: FormGroup;
	public formControlModels: Array<McFormControlModel>;

	constructor(private formBuilder: FormBuilder, private navigationService: NavigationHelperService, private notifications: MCNotificationsService, private orgService: OrganizationsService) {
	}

	ngOnInit() {
		this.isUpdating = false;
		this.isLoading = true;
		this.loadOrganization();
	}

	public cancel() {
		this.navigationService.takeMeHome();
	}

	public update() {
		this.isUpdating = true;
		this.organization.name = this.updateForm.value.name;
		this.organization.address = this.updateForm.value.address;
		this.organization.country = this.updateForm.value.country;
		this.organization.email = this.updateForm.value.emails.email;
		this.organization.url = this.updateForm.value.url;

		this.updateOrganization(this.organization);
	}

	private updateOrganization(organization:Organization) {
		this.orgService.updateOrganization(organization).subscribe(
			_ => {
				this.isUpdating = false;
				this.navigationService.takeMeHome();
			},
			err => {
				this.isUpdating = false;
				this.notifications.generateNotification('Error', 'Error when trying to update organization', MCNotificationType.Error, err);
			}
		);
	}

	private loadOrganization() {
		this.isLoading = true;
		this.orgService.getMyOrganization().subscribe(
			organization => {
				this.organization = organization;
				this.generateForm();
				this.isLoading = false;
			},
			err => {
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to get the organization', MCNotificationType.Error, err);

				this.navigationService.takeMeHome();
			}
		);
	}

	private generateForm() {
		this.updateForm = this.formBuilder.group({});
		this.formControlModels = [];

		var formControlModel:McFormControlModel = {formGroup: this.updateForm, elementId: 'mrn', controlType: McFormControlType.Text, labelName: 'MRN', placeholder: '', isDisabled: true};
		var formControl = new FormControl(this.organization.mrn, formControlModel.validator);
		this.updateForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.updateForm, elementId: 'name', controlType: McFormControlType.Text, labelName: 'Organization name', placeholder: 'Name is required', validator:Validators.required};
		formControl = new FormControl(this.organization.name, formControlModel.validator);
		this.updateForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.updateForm, elementId: 'address', controlType: McFormControlType.Text, labelName: 'Address', placeholder: 'Address is required', validator:Validators.required};
		formControl = new FormControl(this.organization.address, formControlModel.validator);
		this.updateForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.updateForm, elementId: 'country', controlType: McFormControlType.Text, labelName: 'Country', placeholder: 'Country is required', validator:Validators.required};
		formControl = new FormControl(this.organization.country, formControlModel.validator);
		this.updateForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		McUtils.generateEmailConfirmGroup(this.formBuilder, this.updateForm, this.formControlModels, this.organization.email);

		formControlModel = {formGroup: this.updateForm, elementId: 'url', controlType: McFormControlType.Text, labelName: 'URL to homepage', placeholder: 'URL is required', validator:Validators.compose([Validators.required, UrlValidator.validate]), errorText:'Url not valid'};
		formControl = new FormControl(this.organization.url, formControlModel.validator);
		this.updateForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

	}
}
