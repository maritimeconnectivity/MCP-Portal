import {Component, ViewEncapsulation, Input, Output, EventEmitter, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {MCNotificationsService, MCNotificationType} from "../../../../shared/mc-notifications.service";
import {OrganizationsService} from "../../../../backend-api/identity-registry/services/organizations.service";
import {ServiceRegistrySearchRequest} from "./ServiceRegistrySearchRequest";
import {FormGroup, FormBuilder, FormControl} from "@angular/forms";
import {Organization} from "../../../../backend-api/identity-registry/autogen/model/Organization";
import {AuthService} from "../../../../authentication/services/auth.service";
import {SrSearchRequestsService} from "../../../org-service-registry/shared/services/sr-search-requests.service";
import {SHOW_ENDORSEMENTS} from "../../../../shared/app.constants";

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
export class ServiceRegistrySearchComponent implements OnDestroy {
	@Input() searchTitle: string;
	@Input() searchKey: string;
	@Input() isSearching: boolean;
	@Input() preFilterMyOrg: boolean;
	@Input() showEndorsement: boolean;
	@Input() showKeywords: boolean = true;
	@Input() showSimulatedOption: boolean = false;
	@Output() onSearch:EventEmitter<ServiceRegistrySearchRequest> = new EventEmitter<ServiceRegistrySearchRequest>();
	private endorsementMainSwitch = SHOW_ENDORSEMENTS;

	public isLoading: boolean;
	public formGroup: FormGroup;
	public selectValuesOrganizations:Array<SelectModel>;
	public selectValuesOrganizationsForEndorsement:Array<SelectModel>;
	public onSearchFunction: Function;
	public isCollapsed:boolean;
	public collapsedClass:string;
	public toggleClass:string;
	public simulatedState:boolean = false;

  constructor(private searchRequestsService:SrSearchRequestsService, private changeDetector: ChangeDetectorRef, private authService:AuthService, formBuilder:FormBuilder, private orgsService: OrganizationsService, private notifications: MCNotificationsService) {
  	this.formGroup = formBuilder.group({});
  }

	ngOnDestroy() {
		this.changeDetector.detach();
	}

	ngOnInit() {
		this.onSearchFunction = this.search.bind(this);
		this.isCollapsed = false;
		this.setClass();
  	this.isLoading = true;
		this.generateForm();
  	this.loadOrganizations();
	}

	public onSimulatedChange(value: any) {
		this.simulatedState = value;
		this.search();
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

		let endorsedBy:string;
		let registeredBy:string;

		let registeredByValue = this.formGroup.value.registeredBy;
		if (registeredByValue && registeredByValue.toLowerCase().indexOf('undefined') < 0) {
			registeredBy = registeredByValue;
		}

		let endorsedByValue = this.formGroup.value.endorsedBy;
		if (endorsedByValue && endorsedByValue.toLowerCase().indexOf('undefined') < 0) {
			endorsedBy = endorsedByValue;
		}
		this.doSearch(keywords, registeredBy, endorsedBy);
	}

	private searchFromRegisteredBy(registeredBy) {
		let keywords = this.formGroup.value.keywords;

		let endorsedBy:string;

		if (registeredBy && registeredBy.toLowerCase().indexOf('undefined') > -1) {
			registeredBy = undefined;
		}

		let endorsedByValue = this.formGroup.value.endorsedBy;
		if (endorsedByValue && endorsedByValue.toLowerCase().indexOf('undefined') < 0) {
			endorsedBy = endorsedByValue;
		}
		this.doSearch(keywords, registeredBy, endorsedBy);
	}

	private searchFromEndorsedBy(endorsedBy:string) {
		let keywords = this.formGroup.value.keywords;

		let registeredBy:string;


		let registeredByValue = this.formGroup.value.registeredBy;
		if (registeredByValue && registeredByValue.toLowerCase().indexOf('undefined') < 0) {
			registeredBy = registeredByValue;
		}

		if (endorsedBy && endorsedBy.toLowerCase().indexOf('undefined') > -1) {
			endorsedBy = undefined;
		}

		this.doSearch(keywords, registeredBy, endorsedBy);
	}

	private doSearch(keywords:string, registeredBy:string, endorsedBy:string) {
		let searchRequest: ServiceRegistrySearchRequest = {keywords:keywords, registeredBy:registeredBy, endorsedBy:endorsedBy, showOnlySimulated:this.simulatedState};
		this.searchRequestsService.addSearchRequest(this.searchKey, searchRequest);
		this.notifications.errorLog = null; // Remove error log if it is present
		this.onSearch.emit(searchRequest);
	}

	private generateForm() {
		var formControl = new FormControl('');
		this.formGroup.addControl('keywords', formControl);

		formControl = new FormControl(undefined);
		this.formGroup.addControl('showSimulated', formControl);

		formControl = new FormControl(undefined);
		this.formGroup.addControl('registeredBy', formControl);

		formControl = new FormControl(undefined);
		this.formGroup.addControl('endorsedBy', formControl);
	}

	private loadOrganizations() {
		this.orgsService.getAllOrganizations().subscribe(
			organizations => {
				this.setupSearchRequest(organizations);
				this.isLoading = false;
			},
			err => {
				this.setupSearchRequest([]);
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to get organizations', MCNotificationType.Error, err);
			}
		);
	}

	private setupSearchRequest(organizations:Array<Organization>) {
		this.selectValuesOrganizations = [];
		this.selectValuesOrganizations.push({value:undefined, label:'All'});
		this.selectValuesOrganizationsForEndorsement = [];
		this.selectValuesOrganizationsForEndorsement.push({value:undefined, label:'No filter'});

		organizations.forEach(organization => {
			this.selectValuesOrganizations.push({value:organization.mrn, label:organization.name});
			this.selectValuesOrganizationsForEndorsement.push({value:organization.mrn, label:organization.name});
		});
		var registeredBy:string;
		var endorsedBy:string;
		var keywords:string = '';
		let searchRequest = this.searchRequestsService.getSearchRequest(this.searchKey);
		if (searchRequest) {
			registeredBy = searchRequest.registeredBy;
			endorsedBy = searchRequest.endorsedBy;
			if (searchRequest.keywords) {
				keywords = searchRequest.keywords;
			}
			if (searchRequest.showOnlySimulated) {
				this.simulatedState = searchRequest.showOnlySimulated;
			}
		} else if (this.preFilterMyOrg){
			registeredBy = this.authService.authState.orgMrn;
		}
		this.formGroup.patchValue({registeredBy: registeredBy});
		this.formGroup.patchValue({endorsedBy: endorsedBy});
		this.formGroup.patchValue({keywords: keywords});

		this.formGroup.controls['registeredBy'].valueChanges.subscribe(param => this.searchFromRegisteredBy(param));
		this.formGroup.controls['endorsedBy'].valueChanges.subscribe(param => this.searchFromEndorsedBy(param));

		this.changeDetector.detectChanges();
	}
}
