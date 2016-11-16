import { Component, ViewEncapsulation } from '@angular/core';
import {CertificateEntityType} from "../../../../shared/services/certificate-helper.service";
import {LabelValueModel} from "../../../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";
import {ActivatedRoute, Router} from "@angular/router";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";
import {AuthService} from "../../../../../authentication/services/auth.service";
import {Service} from "../../../../../backend-api/identity-registry/autogen/model/Service";
import {IdServicesService} from "../../../../../backend-api/identity-registry/services/id-services.service";
import {ServiceViewModel} from "../../view-models/ServiceViewModel";

@Component({
  selector: 'service-details',
  encapsulation: ViewEncapsulation.None,
  template: require('./service-details.html'),
  styles: []
})
export class ServiceDetailsComponent {
	public labelValues:Array<LabelValueModel>;
	public title:string;
	public isLoading:boolean;
	public service:Service;
	public entityType: CertificateEntityType;
	public certificateTitle: string;
	public showModal:boolean = false;
	public modalDescription:string;
	constructor(private authService: AuthService, private route: ActivatedRoute, private servicesService: IdServicesService, private router:Router, private notifications:MCNotificationsService) {

	}

	ngOnInit() {
		this.entityType = CertificateEntityType.Service;
		this.loadService();
	}

	private loadService() {
		this.isLoading = true;
		let mrn = this.route.snapshot.params['id'];
		this.servicesService.getIdService(mrn).subscribe(
			service => {
				this.service = service;
				this.title = service.name;
				this.isLoading = false;
				this.generateLabelValues();
			},
			err => {
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to get the service', MCNotificationType.Error, err);
			}
		);
	}

	public generateLabelValues() {
		this.labelValues = [];
		if (this.service) {
			this.labelValues.push({label: 'MRN', valueHtml: this.service.mrn});
			this.labelValues.push({label: 'Name', valueHtml: this.service.name});
			this.labelValues.push({label: 'Permissions', valueHtml: this.service.permissions});
			this.labelValues.push({label: 'Certificate domain name', valueHtml: this.service.certDomainName});
			this.labelValues.push({label: 'OIDC Redirect URI', valueHtml: this.service.oidcRedirectUri});
			this.labelValues.push({label: 'OIDC Client ID', valueHtml: this.service.oidcClientId});
			this.labelValues.push({label: 'OIDC Client Secret', valueHtml: this.service.oidcClientSecret});
			this.labelValues.push({label: 'Access type', valueHtml: ServiceViewModel.getLabelForEnum(this.service.oidcAccessType)});

			/*
			 formControlModel = {formGroup: this.registerForm, elementId: 'certDomainName', controlType: McFormControlType.Text, labelName: 'Certificate domain name', placeholder: ''};
			 formControl = new FormControl('', formControlModel.validator);
			 this.registerForm.addControl(formControlModel.elementId, formControl);
			 this.formControlModels.push(formControlModel);

			 formControlModel = {formGroup: this.registerForm, elementId: 'oidcRedirectUri', controlType: McFormControlType.Text, labelName: 'OIDC Redirect URI', placeholder: ''};
			 formControl = new FormControl('', formControlModel.validator);
			 this.registerForm.addControl(formControlModel.elementId, formControl);
			 this.formControlModels.push(formControlModel);

			 let formControlModelSelect:McFormControlModelSelect = {selectValues:this.selectValues(), formGroup: this.registerForm, elementId: 'oidcAccessType', controlType: McFormControlType.Select, labelName: 'Access type', placeholder: ''};
			 formControl = new FormControl('', formControlModelSelect.validator);
			 this.registerForm.addControl(formControlModelSelect.elementId, formControl);
			 this.formControlModels.push(formControlModelSelect);
			 */
		}
	}

	public showDelete():boolean {
		return this.isAdmin() && this.service != null;
	}

	private isAdmin() {
		return this.authService.authState.isAdmin();
	}

	private delete() {
		this.modalDescription = 'Are you sure you want to delete the service?';
		this.showModal = true;
	}
	public cancelModal() {
		this.showModal = false;
	}

	public deleteForSure() {
		this.isLoading = true;
		this.showModal = false;
		this.servicesService.deleteIdService(this.service.mrn).subscribe(
			() => {
				this.router.navigate(['../'], {relativeTo: this.route });
			},
			err => {
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to delete the service', MCNotificationType.Error, err);
			}
		);
	}
}
