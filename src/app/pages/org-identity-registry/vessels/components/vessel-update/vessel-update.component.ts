import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {NavigationHelperService} from "../../../../../shared/navigation-helper.service";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";
import {Vessel} from "../../../../../backend-api/identity-registry/autogen/model/Vessel";
import {FormGroup, Validators, FormBuilder, FormControl} from "@angular/forms";
import {VesselViewModel, VesselAttributeViewModel} from "../../view-models/VesselViewModel";
import {VesselAttribute} from "../../../../../backend-api/identity-registry/autogen/model/VesselAttribute";
import AttributeNameEnum = VesselAttribute.AttributeNameEnum;
import {VesselsService} from "../../../../../backend-api/identity-registry/services/vessels.service";
import {McFormControlModel, McFormControlType} from "../../../../../theme/components/mcForm/mcFormControlModel";


@Component({
	selector: 'vessel-update',
	encapsulation: ViewEncapsulation.None,
	template: require('./vessel-update.html'),
	styles: []
})
export class VesselUpdateComponent implements OnInit {
	public vessel:Vessel;
	public showModal:boolean = false;
	public modalDescription:string;
	// McForm params
	public isLoading = true;
	public isUpdating = false;
	public updateTitle = "Update vessel";
	public updateForm: FormGroup;
	public formControlModels: Array<McFormControlModel>;

	constructor(private formBuilder: FormBuilder, private activatedRoute: ActivatedRoute, private navigationService: NavigationHelperService, private notifications: MCNotificationsService, private vesselsService: VesselsService) {

	}

	ngOnInit() {
		this.isUpdating = false;
		this.isLoading = true;
		this.loadVessel();
	}

	private loadVessel() {
		let mrn = this.activatedRoute.snapshot.params['id'];
		this.vesselsService.getVessel(mrn).subscribe(
			vessel => {
				this.vessel = vessel;
				this.generateForm();
				this.isLoading = false;
			},
			err => {
				this.notifications.generateNotification('Error', 'Error when trying to get the vessel', MCNotificationType.Error, err);

				this.navigationService.navigateToVessel(mrn);
			}
		);
	}

	public cancel() {
		let vesselMrn = (this.vessel ? this.vessel.mrn : '');
		this.navigationService.navigateToVessel(vesselMrn);
	}

	public update() {
		if (this.hasActiveCertificate()){
			this.modalDescription = "<b>Certificates</b> will be <b>invalid</b> if you update the Vessel.<br>You need to revoke the certificates and issue new ones.<br><br>Would you still like to update?";
			this.showModal = true;
		} else {
			this.updateForSure();
		}
	}

	private hasActiveCertificate() : boolean {
		if (this.vessel.certificates && this.vessel.certificates.length > 0) {
			for(let certificate of this.vessel.certificates) {
				if (!certificate.revoked) {
					return true;
				}
			}
		}
		return false;
	}

	public cancelModal() {
		this.showModal = false;
	}

	public updateForSure() {
		this.isUpdating = true;
		this.vessel.name = this.updateForm.value.name;
		this.vessel.permissions = this.updateForm.value.permissions;

		let formAttributes = this.updateForm.value.attributes;
		let vesselAttributes:Array<VesselAttribute> = [];
		Object.getOwnPropertyNames(formAttributes).forEach(propertyName => {
			if (formAttributes[propertyName] && formAttributes[propertyName].length > 0) {
				vesselAttributes.push({attributeName: AttributeNameEnum[propertyName], attributeValue: formAttributes[propertyName]});
			}
		});
		this.vessel.attributes = vesselAttributes;
		this.updateVessel(this.vessel);
	}

	private updateVessel(vessel:Vessel) {
		this.vesselsService.updateVessel(vessel).subscribe(
			_ => {
				this.isUpdating = false;
				this.navigationService.navigateToVessel(vessel.mrn);
			},
			err => {
				this.isUpdating = false;
				this.notifications.generateNotification('Error', 'Error when trying to update vessel', MCNotificationType.Error, err);
			}
		);
	}

	private generateForm() {
		this.updateForm = this.formBuilder.group({});
		this.formControlModels = [];

		var formControlModel:McFormControlModel = {formGroup: this.updateForm, elementId: 'mrn', controlType: McFormControlType.Text, labelName: 'MRN', placeholder: '', isDisabled: true};
		var formControl = new FormControl(this.vessel.mrn, formControlModel.validator);
		this.updateForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.updateForm, elementId: 'name', controlType: McFormControlType.Text, labelName: 'Name', placeholder: 'Name is required', validator:Validators.required};
		formControl = new FormControl(this.vessel.name, formControlModel.validator);
		this.updateForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.updateForm, elementId: 'permissions', controlType: McFormControlType.Text, labelName: 'Permissions', placeholder: ''};
		formControl = new FormControl(this.vessel.permissions, formControlModel.validator);
		this.updateForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);
		this.generateAttributesGroup();
	}

	private generateAttributesGroup() {
		let attributesGroup = this.formBuilder.group({});
		this.updateForm.addControl('attributes', attributesGroup);

		let vesselAttributes:Array<VesselAttributeViewModel> = VesselViewModel.getAllPossibleVesselAttributes();
		vesselAttributes.forEach(vesselAttribute => {
			let formControlModel:McFormControlModel = {formGroup: attributesGroup, elementId: AttributeNameEnum[vesselAttribute.attributeName], controlType: McFormControlType.Text, labelName: vesselAttribute.attributeNameText, placeholder: ''};
			let formControl = new FormControl(this.getAttributeValue(vesselAttribute.attributeName), formControlModel.validator);
			attributesGroup.addControl(formControlModel.elementId, formControl);
			this.formControlModels.push(formControlModel);
		});
	}

	private getAttributeValue(attributeName:AttributeNameEnum) : string {
		for (let attribute of this.vessel.attributes) {
			if (attribute.attributeName === attributeName) {
				return attribute.attributeValue;
			}
		}
		return '';
	}
}
