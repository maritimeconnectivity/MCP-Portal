import { Component, ViewEncapsulation } from '@angular/core';
import {MCNotificationType, MCNotificationsService} from "../../../../../shared/mc-notifications.service";
import {VesselsService} from "../../../../../backend-api/identity-registry/services/vessels.service";
import {ActivatedRoute} from "@angular/router";
import {Vessel} from "../../../../../backend-api/identity-registry/autogen/model/Vessel";
import {LabelValueModel} from "../../../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";
import {VesselViewModel} from "../../view-models/VesselViewModel";
import {CertificateEntityType} from "../../../../shared/services/certificate-helper.service";

@Component({
  selector: 'vessel-details',
  encapsulation: ViewEncapsulation.None,
  template: require('./vessel-details.html'),
  styles: []
})
export class VesselDetailsComponent {
	public labelValues:Array<LabelValueModel>;
	public title:string;
	public isLoading:boolean;
	public vesselViewModel:VesselViewModel;
	public vessel:Vessel;
	public entityType: CertificateEntityType;
	public certificateTitle: string;
  constructor(private route: ActivatedRoute, private vesselsService: VesselsService, private notifications:MCNotificationsService) {

  }

  ngOnInit() {
	  this.entityType = CertificateEntityType.Vessel;
	  this.loadVessel();
  }

	private loadVessel() {
		this.isLoading = true;
		let mrn = this.route.snapshot.params['id'];
		this.vesselsService.getVessel(mrn).subscribe(
			vessel => {
				this.vessel = vessel;
				this.vesselViewModel = new VesselViewModel(vessel);
				this.title = vessel.name;
				this.isLoading = false;
				this.generateLabelValues();
			},
			err => {
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to get the vessel', MCNotificationType.Error, err);
			}
		);
	}

	public generateLabelValues() {
		this.labelValues = [];
		if (this.vesselViewModel) {
			this.labelValues.push({label: 'MRN', valueHtml: this.vesselViewModel.getVessel().mrn});
			this.labelValues.push({label: 'Name', valueHtml: this.vesselViewModel.getVessel().name});
			this.labelValues.push({label: 'Permissions', valueHtml: this.vesselViewModel.getVessel().permissions});
			let attributeViewModels = this.vesselViewModel.getAttributeViewModels();
			attributeViewModels.forEach(attributeViewModel => {
				this.labelValues.push({label: attributeViewModel.attributeNameText, valueHtml: attributeViewModel.attributeValue});
			});
		}
	}
}
