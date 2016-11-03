import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Organization} from "../../../../../backend-api/identity-registry/autogen/model/Organization";
import {NavigationHelperService} from "../../../../../shared/navigation-helper.service";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";
import {OrganizationsService} from "../../../../../backend-api/identity-registry/services/organizations.service";
import {Vessel} from "../../../../../backend-api/identity-registry/autogen/model/Vessel";
import {FormGroup, Validators, FormBuilder, FormControl} from "@angular/forms";
import {McFormControlModel} from "../../../../../theme/components/mcFormControl/mcFormControl.component";
import {VesselViewModel, VesselAttributeViewModel} from "../../view-models/VesselViewModel";
import {VesselAttribute} from "../../../../../backend-api/identity-registry/autogen/model/VesselAttribute";
import AttributeNameEnum = VesselAttribute.AttributeNameEnum;
import {VesselsService} from "../../../../../backend-api/identity-registry/services/vessels.service";
import {MrnHelperService} from "../../../../../shared/mrn-helper.service";


@Component({
  selector: 'vessel-new',
  encapsulation: ViewEncapsulation.None,
  template: require('./vessel-new.html'),
  styles: []
})
export class VesselNewComponent implements OnInit {
	private mrn: string;
	private mrnMask:string;
	private mrnPattern:string;
	private mrnPatternError:string;

  public organization: Organization;

	// McForm params
  public isLoading = true;
  public isRegistering = false;
  public registerTitle = "Register Vessel";
	public registerForm: FormGroup;
	public formControlModels: Array<McFormControlModel>;

  constructor(private formBuilder: FormBuilder, private activatedRoute: ActivatedRoute, private navigationService: NavigationHelperService, private notifications: MCNotificationsService, private orgService: OrganizationsService, private vesselsService: VesselsService, mrnHelper: MrnHelperService) {
    this.organization = {};
	  this.mrnMask = mrnHelper.mrnMaskForVessel();
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
    this.navigationService.cancelCreateVessel();
  }

  public register() {
    this.isRegistering = true;
    let vessel:Vessel = {};
	  vessel.mrn = this.mrn;
	  vessel.name = this.registerForm.value.name;
	  vessel.permissions = this.registerForm.value.permissions;

	  let formAttributes = this.registerForm.value.attributes;
	  let vesselAttributes:Array<VesselAttribute> = [];
	  Object.getOwnPropertyNames(formAttributes).forEach(propertyName => {
		  if (formAttributes[propertyName] && formAttributes[propertyName].length > 0) {
			  vesselAttributes.push({attributeName: AttributeNameEnum[propertyName], attributeValue: formAttributes[propertyName]});
		  }
	  });
		vessel.attributes = vesselAttributes;
    this.createVessel(vessel);
  }

  private createVessel(vessel:Vessel) {
    this.vesselsService.createVessel(vessel).subscribe(
      vessel => {
        this.navigationService.navigateToVessel(vessel.mrn);
        this.isRegistering = false;
      },
      err => {
        this.isRegistering = false;
        this.notifications.generateNotification('Error', 'Error when trying to create vessel', MCNotificationType.Error, err);
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
		let valueNoSpaces = idValue.split(' ').join('').toLowerCase();
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

	  formControlModel = {formGroup: this.registerForm, elementId: 'vesselId', inputType: 'text', labelName: 'Vessel ID', placeholder: 'Vessel ID is required', validator:Validators.required, pattern:this.mrnPattern, errorText:this.mrnPatternError};
	  formControl = new FormControl('', formControlModel.validator);
	  formControl.valueChanges.subscribe(param => this.generateMRN(param));
	  this.registerForm.addControl(formControlModel.elementId, formControl);
	  this.formControlModels.push(formControlModel);

	  formControlModel = {formGroup: this.registerForm, elementId: 'name', inputType: 'text', labelName: 'Name', placeholder: 'Name is required', validator:Validators.required};
	  formControl = new FormControl('', formControlModel.validator);
	  this.registerForm.addControl(formControlModel.elementId, formControl);
	  this.formControlModels.push(formControlModel);

	  formControlModel = {formGroup: this.registerForm, elementId: 'permissions', inputType: 'text', labelName: 'Permissions', placeholder: ''};
	  formControl = new FormControl('', formControlModel.validator);
	  this.registerForm.addControl(formControlModel.elementId, formControl);
	  this.formControlModels.push(formControlModel);

	  this.generateAttributesGroup();
  }

  private generateAttributesGroup() {
    let attributesGroup = this.formBuilder.group({});
	  this.registerForm.addControl('attributes', attributesGroup);

	  let vesselAttributes:Array<VesselAttributeViewModel> = VesselViewModel.getAllPossibleVesselAttributes();
		vesselAttributes.forEach(vesselAttribute => {
			let formControlModel:McFormControlModel = {formGroup: attributesGroup, elementId: AttributeNameEnum[vesselAttribute.attributeName], inputType: 'text', labelName: vesselAttribute.attributeNameText, placeholder: ''};
			let formControl = new FormControl('', formControlModel.validator);
			attributesGroup.addControl(formControlModel.elementId, formControl);
			this.formControlModels.push(formControlModel);
		});
  }
}
