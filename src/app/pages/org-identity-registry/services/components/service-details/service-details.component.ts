import { Component, ViewEncapsulation } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";
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
	public title:string;
	public isLoading:boolean;
	public service:Service;
	public showModal:boolean = false;
	public modalDescription:string;
	constructor(private route: ActivatedRoute, private servicesService: IdServicesService, private router:Router, private notifications:MCNotificationsService) {

	}

	ngOnInit() {
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
			},
			err => {
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to get the service', MCNotificationType.Error, err);
			}
		);
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
