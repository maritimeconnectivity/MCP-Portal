import {Component, ViewEncapsulation, Input, Output, EventEmitter, ChangeDetectorRef} from '@angular/core';
import {MCNotificationsService, MCNotificationType} from "../../../../shared/mc-notifications.service";
import {OrganizationsService} from "../../../../backend-api/identity-registry/services/organizations.service";
import {ServiceRegistrySearchRequest} from "./ServiceRegistrySearchRequest";
import {FormGroup, FormBuilder, FormControl} from "@angular/forms";
import {Organization} from "../../../../backend-api/identity-registry/autogen/model/Organization";
import {AuthService} from "../../../../authentication/services/auth.service";

interface SelectModel {
	label:string;
	value:string;
}

@Component({
  selector: 'service-registry-search',
  encapsulation: ViewEncapsulation.None,
  template: require('./service-registry-search.html'),
	styles: [require('./service-registry-search.scss')]
})
export class ServiceRegistrySearchComponent {
	@Input() preFilterMyOrg: boolean;
	@Input() isSearching: boolean;
	@Input() showEndorsement: boolean;
	@Output() onSearch:EventEmitter<ServiceRegistrySearchRequest> = new EventEmitter<ServiceRegistrySearchRequest>();

	public isLoading: boolean;
	public formGroup: FormGroup;
	public selectValuesOrganizations:Array<SelectModel>;
	public onSearchFunction: Function;
	public isCollapsed:boolean;
	public collapsedClass:string;
	public toggleClass:string;

  constructor(private changeDetector: ChangeDetectorRef, private authService:AuthService, formBuilder:FormBuilder, private orgsService: OrganizationsService, private notifications: MCNotificationsService) {
  	this.formGroup = formBuilder.group({});
  }

	ngOnInit() {
		this.onSearchFunction = this.search.bind(this);
		this.isCollapsed = false;
		this.setClass();
  	this.isLoading = true;
		this.generateForm();
  	this.loadOrganizations();
		}

	public toggle() {
			this.isCollapsed = !this.isCollapsed;
			this.setClass();
		}

	private setClass() {
			this.toggleClass = this.isCollapsed ? 'fa fa-caret-square-o-down' : 'fa fa-caret-square-o-up';
		}

  public search() {
  	let keywords = this.formGroup.value.keywords;

  	// TODO: make multiselect
	  let endorsedBy:Array<string> = [];
	  let registeredBy:Array<string> = [];

	  let registeredByValue = this.formGroup.value.registeredBy;
	  if (registeredByValue && registeredByValue.toLowerCase().indexOf('undefined') < 0) {
		  registeredBy.push(registeredByValue);
	  }

	  let endorsedByValue = this.formGroup.value.endorsedBy;
	  if (endorsedByValue && endorsedByValue.toLowerCase().indexOf('undefined') < 0) {
		  endorsedBy.push(endorsedByValue);
	  }

  	let searchRequest: ServiceRegistrySearchRequest = {keywords:keywords, registeredBy:registeredBy, endorsedBy:endorsedBy};
  	this.onSearch.emit(searchRequest);
  }
	private generateForm() {
		var formControl = new FormControl('');
		this.formGroup.addControl('keywords', formControl);

		formControl = new FormControl(undefined);
		this.formGroup.addControl('registeredBy', formControl);

		formControl = new FormControl(undefined);
		this.formGroup.addControl('endorsedBy', formControl);
	}



	private loadOrganizations() {
		this.orgsService.getAllOrganizations().subscribe(
			organizations => {
				this.setupOrganizationSelectValues(organizations);
				this.isLoading = false;
			},
			err => {
				this.setupOrganizationSelectValues([]);
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to get organizations', MCNotificationType.Error, err);
			}
		);
	}

	private setupOrganizationSelectValues(organizations:Array<Organization>) {
		this.selectValuesOrganizations = [];
		this.selectValuesOrganizations.push({value:undefined, label:'All'});

		organizations.forEach(organization => {
			this.selectValuesOrganizations.push({value:organization.mrn, label:organization.name});
		});
		var registeredBy:string;
		if (this.preFilterMyOrg) {
			registeredBy = this.authService.authState.orgMrn;
		}
		this.formGroup.patchValue({registeredBy: registeredBy});
		this.formGroup.patchValue({endorsedBy: undefined});

		this.changeDetector.detectChanges();
	}
}
