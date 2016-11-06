import {Component, ViewEncapsulation, Input, OnChanges} from '@angular/core';
import {LabelValueModel} from "../../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";
import {Organization} from "../../../../backend-api/identity-registry/autogen/model/Organization";
import {OrganizationViewModelService} from "../../services/organization-view-model.service";
import {LogoService} from "../../../../backend-api/identity-registry/services/logo.service";
import {AuthService} from "../../../../authentication/services/auth.service";

@Component({
  selector: 'organization-details-table',
  encapsulation: ViewEncapsulation.None,
  template: require('./organization-details-table.html'),
  styles: []
})
export class OrganizationDetailsTableComponent implements OnChanges {
  private labelValues:Array<LabelValueModel>;
  @Input() isLoading:boolean;
  @Input() organization: Organization;
	public logo:any;
	public isLoadingOrgAndLogo:boolean = true;
  constructor(private authService:AuthService, private logoService: LogoService, private orgViewModelService: OrganizationViewModelService) {
  }
  ngOnChanges() {
    if (this.organization) {
	    this.loadLogo();
    }
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
			},
			err => {
				if (this.authService.isMyOrg(this.organization.mrn) || this.authService.authState.isSiteAdmin()) {
					this.logo = 'assets/img/no_organization.png';
				}
				this.setLabelValues();
			}
		);
	}

}
