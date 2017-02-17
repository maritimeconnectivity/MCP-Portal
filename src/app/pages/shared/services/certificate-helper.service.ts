import {Injectable, OnInit} from '@angular/core';
import {Certificate} from "../../../backend-api/identity-registry/autogen/model/Certificate";
import {CertificateViewModel} from "../view-models/CertificateViewModel";
import {CertificateRevocation} from "../../../backend-api/identity-registry/autogen/model/CertificateRevocation";
import RevokationReasonEnum = CertificateRevocation.RevokationReasonEnum;
import {EnumsHelper} from "../../../shared/enums-helper";

export enum CertificateEntityType {
  Device,
  Organization,
  Service,
  User,
  Vessel
}
export interface CertificateRevocationTypeViewModel {
	value?:string;
	label?:string;
}

@Injectable()
export class CertificateHelperService implements OnInit {
  constructor() {
  }

  ngOnInit() {

  }

	public getAllRevocationTypes(): Array<CertificateRevocationTypeViewModel> {
		let models:Array<CertificateRevocationTypeViewModel> = [];

		let keysAndValues = EnumsHelper.getKeysAndValuesFromEnum(RevokationReasonEnum);
		keysAndValues.forEach(enumKeyAndValue => {
			let model:CertificateRevocationTypeViewModel = {};
			model.value = enumKeyAndValue.value;
			model.label = this.getRevokeReasonTextFromRevokationReason(enumKeyAndValue.value);
			models.push(model);
		});
		return models;
	}

  public convertCertificatesToViewModels(certificates:Array<Certificate>): Array<CertificateViewModel> {
    let viewModels: Array<CertificateViewModel> = [];
    if (certificates && certificates.length > 0) {
      certificates.forEach(certificate => {
        viewModels.push(this.certificateViewModelFromCertificate(certificate));
      });
    }
    return viewModels;
  }

  public certificateViewModelFromCertificate(certificate:Certificate): CertificateViewModel {
    let certificateViewModel: CertificateViewModel = certificate;
    certificateViewModel.revokeReasonText = this.getRevokeReasonText(certificate.revokeReason+'ddsf');
    return certificateViewModel;
  }

  public getRevokeReasonText(revokeReason?:any):string {
    var reasonText = '';
    if (revokeReason) {
      reasonText = revokeReason;
      let revokeReasonEnum:RevokationReasonEnum = revokeReason;
      if (RevokationReasonEnum[revokeReasonEnum]) {
        reasonText = this.getRevokeReasonTextFromRevokationReason(revokeReasonEnum);
      }
    }
    return reasonText;
  }

  public getRevokeReasonTextFromRevokationReason(revokationReason:RevokationReasonEnum):string {
    var reasonText = '';
    switch (revokationReason) {
      case RevokationReasonEnum.Aacompromise: {
        reasonText = 'AA compromised';
        break;
      }
      case RevokationReasonEnum.Affiliationchanged: {
        reasonText = 'Afiliation changed';
        break;
      }
      case RevokationReasonEnum.Cacompromise: {
	      console.log('compromised: ',revokationReason);
        reasonText = 'CA compromised';
        break;
      }
      case RevokationReasonEnum.Certificatehold: {
        reasonText = 'Certificate Hold';
        break;
      }
      case RevokationReasonEnum.Cessationofoperation: {
        reasonText = 'Cessation of Operation';
        break;
      }
      case RevokationReasonEnum.Keycompromise: {
        reasonText = 'Key compromised';
        break;
      }
      case RevokationReasonEnum.Privilegewithdrawn: {
        reasonText = 'Privilege withdrawn';
        break;
      }
      case RevokationReasonEnum.Removefromcrl: {
        reasonText = 'Remove from CRL';
        break;
      }
      case RevokationReasonEnum.Superseded: {
        reasonText = 'Superseded';
        break;
      }
      case RevokationReasonEnum.Unspecified: {
        reasonText = 'Unspecified';
        break;
      }
      default : {
	      console.log('default: ',revokationReason);
        reasonText = RevokationReasonEnum[revokationReason];
      }
    }
    return reasonText;
  }
}
