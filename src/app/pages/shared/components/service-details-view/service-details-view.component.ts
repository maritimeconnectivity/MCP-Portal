import {Component, ViewEncapsulation, Input, Output, EventEmitter} from '@angular/core';
import {LabelValueModel} from "../../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";
import {Service} from "../../../../backend-api/identity-registry/autogen/model/Service";
import {CertificateEntityType} from "../../services/certificate-helper.service";
import {FileHelperService} from "../../../../shared/file-helper.service";
import {AuthService} from "../../../../authentication/services/auth.service";
import {ServiceViewModel} from "../../../org-identity-registry/services/view-models/ServiceViewModel";
import {MCNotificationType, MCNotificationsService} from "../../../../shared/mc-notifications.service";
import {IdServicesService} from "../../../../backend-api/identity-registry/services/id-services.service";
import {NavigationHelperService} from "../../../../shared/navigation-helper.service";
import {TOKEN_DELIMITER} from "../../../../shared/app.constants";
import {InstancesService} from "../../../../backend-api/service-registry/services/instances.service";
import {Instance} from "../../../../backend-api/service-registry/autogen/model/Instance";

@Component({
  selector: 'service-details-view',
  encapsulation: ViewEncapsulation.None,
  template: require('./service-details-view.html'),
  styles: []
})
export class ServiceDetailsViewComponent {
	@Input() service:Service;
	@Input() shouldShowDelete:boolean = true;
	@Input() shouldShowUpdate:boolean = true;
	@Input() shouldShowLinkToInstance:boolean = true;
	@Input() isLoading:boolean;
	@Input() title:string;

	@Output() deleteAction:EventEmitter<any> = new EventEmitter<any>();
	@Output() updateAction:EventEmitter<any> = new EventEmitter<any>();

	public labelValues:Array<LabelValueModel>;
	public entityType: CertificateEntityType;
	public entityMrn:string;
	public onGotoVessel: Function;
	public onGotoInstance: Function;
	private linkToInstance:boolean = false;
	public isLoadingInstance:boolean = false;

	constructor(private fileHelperService:FileHelperService, private authService: AuthService, private servicesService: IdServicesService, private notifications:MCNotificationsService, private navigationHelperService: NavigationHelperService, private instancesService:InstancesService) {

	}

	ngOnInit() {
		this.isLoadingInstance = true;
		this.entityType = CertificateEntityType.Service;
		this.onGotoVessel = this.gotoVessel.bind(this);
		this.onGotoInstance = this.gotoInstance.bind(this);
	}

	ngOnChanges() {
		if (this.service) {
			this.entityMrn = this.service.mrn + TOKEN_DELIMITER + this.service.instanceVersion;
			if (this.shouldShowLinkToInstance) {
				this.loadInstance();
			} else {
				this.generateLabelValues();
				this.isLoadingInstance = false;
			}
		}
	}

	private loadInstance() {
		this.instancesService.getInstance(this.service.mrn, this.service.instanceVersion).subscribe(
			instance => {
				this.linkToInstance = true;
				this.generateLabelValues();
				this.isLoadingInstance = false;
			},
			err => {
				if (err.status == 404) {
					this.linkToInstance = false;
					this.generateLabelValues();
				} else {
					this.notifications.generateNotification('Error', 'Error when trying to get the Instance for the ID service', MCNotificationType.Error, err);
				}
				this.isLoadingInstance = false;
			}
		);
	}

	public showDownload():boolean {
		return this.service.oidcClientId && this.isAdmin();
	}

	public downloadXML() {
		this.servicesService.getIdServiceJbossXml(this.service.mrn, this.service.instanceVersion).subscribe(
			xmlString => {
				this.fileHelperService.downloadFile(xmlString, 'text/xml', 'keycloak-oidc-subsystem.xml');
			},
			err => {
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to download the XML', MCNotificationType.Error, err);
			}
		);
	}

	public downloadJSON() {
		this.servicesService.getServiceKeycloakJson(this.service.mrn, this.service.instanceVersion).subscribe(
			jsonString => {
				this.fileHelperService.downloadFile(jsonString, 'text/json', 'keycloak.json');
			},
			err => {
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to download the JSON', MCNotificationType.Error, err);
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
			if (this.service.oidcRedirectUri) {
				this.labelValues.push({label: 'OIDC Redirect URI', valueHtml: this.service.oidcRedirectUri});
			}
			if (this.service.oidcClientId) {
				this.labelValues.push({label: 'OIDC Client ID', valueHtml: this.service.oidcClientId});
			}
			if (this.service.oidcClientSecret) {
				this.labelValues.push({label: 'OIDC Client Secret', valueHtml: this.service.oidcClientSecret});
			}

			if (this.service.oidcAccessType) {
				this.labelValues.push({label: 'Access type', valueHtml: ServiceViewModel.getLabelForEnum(this.service.oidcAccessType)});
			}

			this.generateLabelValueForVessel();

			this.generateLabelValueForInstance();
		}
	}

	private generateLabelValueForVessel() {
		let vessel = this.service.vessel;
		if (vessel) {
			let label = 'Linked vessel';
			this.labelValues.push({label: label, valueHtml: vessel.name, linkFunction: this.onGotoVessel, linkValue: [vessel.mrn]});
		}
	}

	private generateLabelValueForInstance() {
		if (this.shouldShowLinkToInstance && this.linkToInstance) {
			let label = 'Linked Instance';
			this.labelValues.push({label: label, valueHtml: this.service.name, linkFunction: this.onGotoInstance, linkValue: [this.service.mrn, this.service.instanceVersion]});
		}
	}

	public showDelete():boolean {
		return this.shouldShowDelete && this.isAdmin() && this.service != null;
	}

	public showUpdate():boolean {
		return this.shouldShowUpdate && this.isAdmin() && this.service != null;
	}

	private isAdmin() {
		return this.authService.authState.isAdmin();
	}

	private delete() {
		this.deleteAction.emit('');
	}

	private update() {
		this.updateAction.emit('');
	}

	private gotoInstance(linkValue:any) {
		try {
			this.navigationHelperService.navigateToOrgInstance(linkValue[0], linkValue[1]);
		} catch (error) {
			this.notifications.generateNotification('Error', 'Error when trying to go to instance', MCNotificationType.Error, error);
		}
	}

	private gotoVessel(linkValue:any) {
		try {
			this.navigationHelperService.navigateToVessel(linkValue[0]);
		} catch (error) {
			this.notifications.generateNotification('Error', 'Error when trying to go to vessel', MCNotificationType.Error, error);
		}
	}
}
