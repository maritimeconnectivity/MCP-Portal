import {Component, OnInit, HostListener} from '@angular/core';
import {MCNotificationsService, MCNotificationType} from "../shared/mc-notifications.service";
import {McFormControlModel} from "../theme/components/mcFormControl/mcFormControl.component";
import {FormGroup, FormBuilder, FormControl, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {AuthService} from "../authentication/services/auth.service";
import {MrnHelperService} from "../shared/mrn-helper.service";
import {Organization} from "../backend-api/identity-registry/autogen/model/Organization";
import {EmailValidator} from "../theme/validators/email.validator";
import {layoutSizes} from "../theme/theme.constants";
import {OrganizationsService} from "../backend-api/identity-registry/services/organizations.service";
import {McHttpService} from "../backend-api/shared/mc-http.service";
import {NavigationHelperService} from "../shared/navigation-helper.service";
import {UrlValidator} from "../theme/validators/url.validator";
import {EqualPasswordsValidator} from "../theme/validators/equalPasswords.validator";

@Component({
  selector: 'apply-org',
  styles: [require('./apply-org.scss')],
  templateUrl: 'apply-org.component.html'
})

export class ApplyOrgComponent implements OnInit {
	public class:string;
	public classWidth:string;

	private mrn: string;
	private mrnMask:string;
	private mrnPattern:string;
	private mrnPatternError:string;
	// McForm params
	public isLoading = true;
	public isRegistering = false;
	public registerTitle = "Apply";
	public registerForm: FormGroup;
	public formControlModels: Array<McFormControlModel>;

  constructor(private navigationHelper: NavigationHelperService, private formBuilder: FormBuilder, private authService: AuthService, private router:Router, private notificationService: MCNotificationsService, mrnHelper: MrnHelperService, private organizationsService: OrganizationsService) {
	  this.mrnMask = mrnHelper.mrnMaskForOrganization();
	  this.mrnPattern = mrnHelper.mrnPattern();
	  this.mrnPatternError = mrnHelper.mrnPatternError();
	  this.mrn = this.mrnMask;
  }

  ngOnInit() {
	  this.calculateClass();
	  this.generateForm();
	  this.isLoading = false;
  }

	@HostListener('window:resize')
	public onWindowResize():void {
		this.calculateClass();
	}

	private calculateClass():void {
		this.class = (this.isWindowToSmall()?'apply-small':'apply-big');
		this.classWidth = (this.isWindowToNarrow()?'':'apply-big-width');
	}

	private isWindowToSmall():boolean {
		return window.innerHeight < 700;
	}

	private isWindowToNarrow():boolean {
		return window.innerWidth < layoutSizes.resWidthHideSidebar;
	}

	public cancel() {
		this.router.navigate([this.authService.loginUrl()]);
	}

	public apply() {
		this.isRegistering = true;

		let organization:Organization = {};
		organization.name = this.registerForm.value.name;
		organization.address = this.registerForm.value.address;
		organization.country = this.registerForm.value.country;
		organization.email = this.registerForm.value.emails.email;
		organization.mrn = this.mrn;
		organization.url = this.registerForm.value.url;
		this.applyOrganization(organization);
	}

	private applyOrganization(organization:Organization) {
		McHttpService.nextCallShouldNotAuthenticate();
		this.organizationsService.applyOrganization(organization).subscribe(
			organization => {
				this.isRegistering = false;
				this.notificationService.generateNotification('Apply', 'You have successfully applied to join the Maritime Cloud. An email will be send with confirmation.', MCNotificationType.Info);
				this.navigationHelper.takeMeHome();
			},
			err => {
				this.isRegistering = false;
				this.notificationService.generateNotification('Error', 'Error when trying to apply', MCNotificationType.Error, err);
			}
		);
	}

	private generateMRN(idValue:string) {
		var mrn = (idValue?idValue:'');
		let valueNoSpaces = mrn.split(' ').join('').toLowerCase();
		this.mrn = this.mrnMask + valueNoSpaces;
		this.registerForm.patchValue({mrn: this.mrn});
	}

	private generateForm() {
		this.registerForm = this.formBuilder.group({});
		this.formControlModels = [];

		var formControlModel:McFormControlModel = {formGroup: this.registerForm, elementId: 'mrn', inputType: 'text', labelName: 'MRN', placeholder: '', isDisabled: true};
		var formControl = new FormControl(this.mrn, formControlModel.validator);
		this.registerForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.registerForm, elementId: 'orgId', inputType: 'text', labelName: 'Organization shortname', placeholder: 'Enter shortname to generate MRN', validator:Validators.required, pattern:this.mrnPattern, errorText:this.mrnPatternError};
		formControl = new FormControl('', formControlModel.validator);
		formControl.valueChanges.subscribe(param => this.generateMRN(param));
		this.registerForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.registerForm, elementId: 'name', inputType: 'text', labelName: 'Name', placeholder: 'Name is required', validator:Validators.required};
		formControl = new FormControl('', formControlModel.validator);
		this.registerForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.registerForm, elementId: 'address', inputType: 'text', labelName: 'Address', placeholder: 'Address is required', validator:Validators.required};
		formControl = new FormControl('', formControlModel.validator);
		this.registerForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.registerForm, elementId: 'country', inputType: 'text', labelName: 'Country', placeholder: 'Country is required', validator:Validators.required};
		formControl = new FormControl('', formControlModel.validator);
		this.registerForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		this.generateEmailGroup();

		formControlModel = {formGroup: this.registerForm, elementId: 'url', inputType: 'text', labelName: 'URL to homepage', placeholder: 'URL is required', validator:Validators.compose([Validators.required, UrlValidator.validate]), errorText:'Url not valid'};
		formControl = new FormControl('', formControlModel.validator);
		this.registerForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);
	}

	// TODO put as generel
	private generateEmailGroup() {
		let emails = this.formBuilder.group({});
		this.registerForm.addControl('emails', emails);

		let formControlModel:McFormControlModel = {formGroup: emails, elementId: 'email', inputType: 'text', labelName: 'Email', placeholder: 'Email is required', validator:Validators.compose([Validators.required, EmailValidator.validate]), errorText:'Email not valid'};
		let formControlEmail = new FormControl('', formControlModel.validator);
		emails.addControl(formControlModel.elementId, formControlEmail);
		this.formControlModels.push(formControlModel);


		formControlModel = {formGroup: emails, elementId: 'emailConfirm', inputType: 'text', labelName: 'Confirm email', placeholder: '', validator:Validators.required, errorText:'Emails not identical', requireGroupValid:true};
		let formControlEmail2 = new FormControl('');
		emails.addControl(formControlModel.elementId, formControlEmail2);
		this.formControlModels.push(formControlModel);

		emails.setValidators(Validators.compose([Validators.required, EqualPasswordsValidator.validate(formControlEmail, formControlEmail2)]));
	}
}
