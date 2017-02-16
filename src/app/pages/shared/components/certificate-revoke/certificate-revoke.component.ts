import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {MCNotificationsService, MCNotificationType} from "../../../../shared/mc-notifications.service";
import {NavigationHelperService, queryKeys} from "../../../../shared/navigation-helper.service";
import {ActivatedRoute} from "@angular/router";
import {CertificateEntityType, CertificateHelperService} from "../../services/certificate-helper.service";
import {CertificatesService} from "../../../../backend-api/identity-registry/services/certificates.service";
import {LabelValueModel} from "../../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";
import {FormGroup, FormBuilder, FormControl, Validators} from "@angular/forms";
import {
	McFormControlModel, McFormControlType,
	McFormControlModelSelect, McFormControlModelDatepicker, SelectModel
} from "../../../../theme/components/mcForm/mcFormControlModel";
import {SelectValidator} from "../../../../theme/validators/select.validator";
import {CertificateRevocation} from "../../../../backend-api/identity-registry/autogen/model/CertificateRevocation";
import RevokationReasonEnum = CertificateRevocation.RevokationReasonEnum;


@Component({
  selector: 'certificate-revoke',
  encapsulation: ViewEncapsulation.None,
  template: require('./certificate-revoke.html'),
  styles: []
})
export class CertificateRevokeComponent implements OnInit {
  public entityType: CertificateEntityType;
  public entityMrn: string;
	public entityTitle: string;
	public certificateId: number;
  public isLoading: boolean;
  
	public isRevoking = false;
	public revokeTitle = "Revoke";
	public revokeForm: FormGroup;
	public formControlModels: Array<McFormControlModel>;

  public labelValues:Array<LabelValueModel>;

  constructor(private certificateHelper:CertificateHelperService, private formBuilder: FormBuilder, private certificateService: CertificatesService, private route:ActivatedRoute, private navigationHelper: NavigationHelperService, private notificationService: MCNotificationsService) {
  }

  ngOnInit() {
    this.isLoading = true;
    let entityType = this.route.snapshot.queryParams[queryKeys.ENTITY_TYPE];
    let entityMrn = this.route.snapshot.queryParams[queryKeys.ENTITY_MRN];
	  let entityTitle = this.route.snapshot.queryParams[queryKeys.ENTITY_TITLE];
	  let certificateId = this.route.snapshot.queryParams[queryKeys.CERT_ID];
    if (entityType == null || !entityMrn || !entityTitle) {
      this.notificationService.generateNotification("Error", "Unresolved state when trying to revoke certificate", MCNotificationType.Error);
      this.navigationHelper.takeMeHome();
    }
    this.entityMrn = entityMrn;
    this.entityTitle = entityTitle;
    this.entityType = +entityType; // +-conversion from string to int
	  this.certificateId = certificateId;
    this.generateLabelValues();
    this.generateForm();

	  this.isLoading = false;
  }

  public revoke() {
    this.isRevoking = true;
    let revokeDate:Date = this.revokeForm.value.revokedAt;
	  let tempRevocationReason = this.revokeForm.value.revocationReason;
	  var revocationReason:RevokationReasonEnum = null;
	  if (tempRevocationReason && tempRevocationReason.toLowerCase().indexOf('undefined') < 0) {
		  revocationReason = tempRevocationReason;
	  }

	  console.log("SSS: ", revokeDate.valueOf());
    let certificateRevocation:CertificateRevocation = {revokationReason:revocationReason, revokedAt:'1499925534000'}//revokeDate.valueOf()}
    this.certificateService.revokeCertificate(this.entityType, this.entityMrn, this.certificateId, certificateRevocation).subscribe(
      _ => {
        this.isRevoking = false;
        this.navigationHelper.cancelNavigateCertificates();
      },
      err => {
        this.isRevoking = false;
        this.notificationService.generateNotification('Error', 'Error when trying to revoke certificate', MCNotificationType.Error, err);
      }
    );
  }

  public cancel() {
    this.navigationHelper.cancelNavigateCertificates();
  }

  private generateLabelValues() {
    this.labelValues = [];
    this.labelValues.push({label: 'Name', valueHtml: this.entityTitle});
    this.labelValues.push({label: 'MRN', valueHtml: this.entityMrn});
  }
  
	private generateForm() {
		this.revokeForm = this.formBuilder.group({});
		this.formControlModels = [];

		let selectValues = this.selectValues();
		let formControlModelSelect:McFormControlModelSelect = {selectValues:selectValues, formGroup: this.revokeForm, elementId: 'revocationReason', controlType: McFormControlType.Select, labelName: '', placeholder: '', validator:SelectValidator.validate, showCheckmark:false};
		var formControl = new FormControl('', formControlModelSelect.validator);
		this.revokeForm.addControl(formControlModelSelect.elementId, formControl);
		this.formControlModels.push(formControlModelSelect);

		let formControlModel:McFormControlModelDatepicker = {minDate:new Date(), formGroup: this.revokeForm, elementId: 'revokedAt', controlType: McFormControlType.Datepicker, labelName: '', validator:Validators.required};
		formControl = new FormControl('', formControlModel.validator);
		this.revokeForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);
	}

	private selectValues():Array<SelectModel> {
		let selectValues:Array<SelectModel> = [];
		selectValues.push({value:undefined, label:'Choose reason...', isSelected: true});
		let allrevokeTypes = this.certificateHelper.getAllRevocationTypes();
		allrevokeTypes.forEach(revokeType => {
			selectValues.push({value:revokeType.value, label:revokeType.label, isSelected: false});
		});
		return selectValues;
	}
}
