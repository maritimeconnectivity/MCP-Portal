import {EnumsHelper} from "../../../../shared/enums-helper";
import {Service} from "../../../../backend-api/identity-registry/autogen/model/Service";
import OidcAccessTypeEnum = Service.OidcAccessTypeEnum;

export interface OidcAccessTypeViewModel {
	value?:string;
	label?:string;
}

export class ServiceViewModel {


	public static getAllOidcAccessTypes(): Array<OidcAccessTypeViewModel> {
		let models:Array<OidcAccessTypeViewModel> = [];

		let keysAndValues = EnumsHelper.getKeysAndValuesFromEnum(OidcAccessTypeEnum);
		keysAndValues.forEach(enumKeyAndValue => {
			let model:OidcAccessTypeViewModel = {};
			model.value = enumKeyAndValue.value;
			model.label = ServiceViewModel.getLabelForEnum(enumKeyAndValue.value);
			models.push(model);
		});
		return models;
	}


	public static getLabelForEnum(oidcAccessTypeEnum:OidcAccessTypeEnum):string {
		if (!oidcAccessTypeEnum) {
			return '';
		}
		var text = '';
		switch (oidcAccessTypeEnum) {
			case OidcAccessTypeEnum.bearer_only: {
				text = 'Bearer only';
				break;
			}
			case OidcAccessTypeEnum.confidential: {
				text = 'Confidential';
				break;
			}
			case OidcAccessTypeEnum.public: {
				text = 'Public';
				break;
			}
			default : {
				text = OidcAccessTypeEnum[oidcAccessTypeEnum];
				if (!text) {
					text = ''+ oidcAccessTypeEnum;
				}
			}
		}
		return text;
	}

}