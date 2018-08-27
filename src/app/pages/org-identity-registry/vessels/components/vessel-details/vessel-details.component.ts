import { Component, ViewEncapsulation } from '@angular/core';
import {
    MCNotificationsService,
    MCNotificationType
} from "../../../../../shared/mc-notifications.service";
import { VesselsService } from "../../../../../backend-api/identity-registry/services/vessels.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Vessel } from "../../../../../backend-api/identity-registry/autogen/model/Vessel";
import { LabelValueModel } from "../../../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";
import { VesselViewModel } from "../../view-models/VesselViewModel";
import { CertificateEntityType } from "../../../../shared/services/certificate-helper.service";
import { AuthPermission, AuthService } from "../../../../../authentication/services/auth.service";
import { NavigationHelperService } from "../../../../../shared/navigation-helper.service";
import { Service } from "../../../../../backend-api/identity-registry/autogen/model/Service";
import { VesselImageService } from "../../../../../backend-api/identity-registry/services/vessel-image.service";

@Component({
  selector: 'vessel-details',
  encapsulation: ViewEncapsulation.None,
  template: require('./vessel-details.html'),
  styles: []
})
export class VesselDetailsComponent {
	public labelValues:Array<LabelValueModel>;
	public vesselServices:Array<Service>;
	public title:string;
	public isLoadingVesselAndImage:boolean;
	public vesselViewModel:VesselViewModel;
	public vessel:Vessel;
	public entityType: CertificateEntityType;
	public certificateTitle: string;
	public showModal:boolean = false;
	public modalDescription:string;

	// Images
	public image:string;
	public canChangeImage:boolean;
	public uploadingImage:boolean = false;

  constructor(private vesselImageService:VesselImageService, private authService: AuthService, private route: ActivatedRoute, private router:Router, private vesselsService: VesselsService, private notifications:MCNotificationsService, private navigationHelper: NavigationHelperService) {

  }

  ngOnInit() {
	  this.entityType = CertificateEntityType.Vessel;
	  this.loadVessel();
  }

  public showUpdate():boolean {
		return this.isAdmin() && this.vessel != null;
	}

	public showDelete():boolean {
		return this.isAdmin() && this.vessel != null;
	}

  private isAdmin() {
	  return this.authService.authState.hasPermission(AuthPermission.VesselAdmin);
  }

	private loadVessel() {
		this.isLoadingVesselAndImage = true;
		let mrn = this.route.snapshot.params['id'];
		this.vesselsService.getVessel(mrn).subscribe(
			vessel => {
				this.vessel = vessel;
				this.vesselViewModel = new VesselViewModel(vessel);
				this.title = vessel.name;

				this.canChangeImage = this.canChangeTheImage();
				this.loadImage();
			},
			err => {
				this.isLoadingVesselAndImage = false;
				this.notifications.generateNotification('Error', 'Error when trying to get the vessel', MCNotificationType.Error, err);
			}
		);
	}

	private loadImage(){
		this.vesselImageService.getImageForVessel(this.vessel.mrn).subscribe(
			image => {
				this.image = URL.createObjectURL(new Blob([image]));
				this.uploadingImage = false;
				this.imageLoaded();
				this.loadVesselServices();
			},
			err => {
				if (this.canChangeTheImage()) {
					this.image = 'assets/img/no_ship.png';
				}
				this.uploadingImage = false;
				this.imageLoaded();
				this.loadVesselServices();
			}
		);
	}

	private imageLoaded() {

	}

	private canChangeTheImage():boolean {
		return this.authService.authState.hasPermission(AuthPermission.VesselAdmin);
	}

	public uploadImage(image:any) {
		let oldImage = this.image;
		this.uploadingImage = true;
		this.vesselImageService.uploadImage(this.vessel.mrn, image).subscribe(
			image => {
				this.loadImage();
			},
			err => {
				this.image = oldImage;
				this.uploadingImage = false;
				this.notifications.generateNotification('Error', 'Error when trying to upload vessel image', MCNotificationType.Error, err);
			}
		);
	}

	private loadVesselServices() {
		this.vesselsService.getVesselServices(this.vessel.mrn).subscribe(
			services => { // FIXME: change when new api is here
				this.vesselServices = services;
				this.isLoadingVesselAndImage = false;
				this.generateLabelValues();
			},
			err => {
				this.isLoadingVesselAndImage = false;
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

	public update() {
		this.navigationHelper.navigateToUpdateVessel(this.vessel.mrn);
	}

	private delete() {
		this.modalDescription = 'Are you sure you want to delete the vessel?';
		this.showModal = true;
	}
	public cancelModal() {
		this.showModal = false;
	}

	public deleteForSure() {
		this.isLoadingVesselAndImage = true;
		this.showModal = false;
		this.vesselsService.deleteVessel(this.vessel.mrn).subscribe(
			() => {
				this.router.navigate(['../'], {relativeTo: this.route });
			},
			err => {
				this.isLoadingVesselAndImage = false;
				this.notifications.generateNotification('Error', 'Error when trying to delete the vessel', MCNotificationType.Error, err);
			}
		);
	}
}
