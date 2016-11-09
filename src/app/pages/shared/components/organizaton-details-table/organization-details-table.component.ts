import {Component, ViewEncapsulation, Input, OnChanges, Output, EventEmitter} from '@angular/core';
import {LabelValueModel} from "../../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";
import {Organization} from "../../../../backend-api/identity-registry/autogen/model/Organization";
import {OrganizationViewModelService} from "../../services/organization-view-model.service";
import {LogoService} from "../../../../backend-api/identity-registry/services/logo.service";
import {AuthService} from "../../../../authentication/services/auth.service";
import {MCNotificationType, MCNotificationsService} from "../../../../shared/mc-notifications.service";

@Component({
  selector: 'organization-details-table',
  encapsulation: ViewEncapsulation.None,
  template: require('./organization-details-table.html'),
  styles: []
})
export class OrganizationDetailsTableComponent implements OnChanges {
  private labelValues:Array<LabelValueModel>;
	@Input() displayLogo:boolean = true;
  @Input() isLoading:boolean;
	@Input() organization: Organization;
	@Output() onLogoLoaded: EventEmitter<any> = new EventEmitter<any>();
	public logo:string;
	public canChangeLogo:boolean;
	public isLoadingOrgAndLogo:boolean = true;
	public uploadingLogo:boolean = false;
  constructor(private authService:AuthService, private logoService: LogoService, private orgViewModelService: OrganizationViewModelService, private notifications:MCNotificationsService) {
  }
  ngOnChanges() {
    if (this.organization) {
	    this.canChangeLogo = this.canChangeTheLogo();
	    this.loadLogo();
    }
  }
  public uploadLogo(logo:any) {
	  let oldLogo = this.logo;
	  this.uploadingLogo = true;
	  this.logoService.uploadLogo(this.organization.mrn, logo).subscribe(
		  logo => {
			  this.loadLogo();
		  },
		  err => {
			  this.logo = oldLogo;
			  this.uploadingLogo = false;
			  this.notifications.generateNotification('Error', 'Error when trying to upload logo', MCNotificationType.Error, err);
		  }
	  );
  }

  private setLabelValues() {
	  this.labelValues = this.orgViewModelService.generateLabelValuesForOrganization(this.organization);
	  this.isLoadingOrgAndLogo = false;
  }

	private loadLogo(){
		this.logoService.getLogoForOrganization(this.organization.mrn).subscribe(
			logo => {
				this.logo = URL.createObjectURL(new Blob([logo]));
				this.setLabelValues();
				this.uploadingLogo = false;
				this.onLogoLoaded.emit('');
			},
			err => {
				if (this.canChangeTheLogo()) {
					this.logo = 'assets/img/no_organization.png';
				}
				this.setLabelValues();
				this.uploadingLogo = false;
				this.onLogoLoaded.emit('');
			}
		);
	}
	private canChangeTheLogo():boolean {
		return this.isFirefox() && ( (this.authService.authState.isAdmin() && this.authService.isMyOrg(this.organization.mrn)) || this.authService.authState.isSiteAdmin());
	}

	// TODO: fix this so it works in other browsers
	private isFirefox():boolean {
		let userAgent = window.navigator.userAgent;
		return userAgent.toLowerCase().indexOf('firefox') > -1;
	}
}
