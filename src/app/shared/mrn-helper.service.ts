import {Injectable} from "@angular/core";
import {AuthService} from "../authentication/services/auth.service";

// TODO this is only a temp solution until there is a backend service to do it
@Injectable()
export class MrnHelperService {
	private idpNamespace = IDP_NAMESPACE;
	public mrnMCP: string = 'urn:mrn:mcp:';

	constructor(private authService: AuthService) {
	}

	private orgShortNameFromMrn(orgMrn:string){
		let orgSplit = orgMrn.split(':');
		return orgSplit[orgSplit.length-1];
	}

	private mrnPreFix():string {
		return this.mrnPreFixForOrg(this.authService.authState.orgMrn);
	}

	private mrnPreFixForOrg(orgMrn:string):string {
		let orgSplit = orgMrn.split(':org:');
		return orgSplit[0] + ":";
	}

	public orgShortName():string {
		return this.orgShortNameFromMrn(this.authService.authState.orgMrn);
	}

	public mrnPattern(): string {
		return "^((([-._a-z0-9]|~)|%[0-9a-f][0-9a-f]|([!$&'()*+,;=])|:|@)((([-._a-z0-9]|~)|%[0-9a-f][0-9a-f]|([!$&'()*+,;=])|:|@)|\/)*)$";
	}
	public mrnPatternError():string {
		return "It should contain at least 3 characters and only a-z 0-9 + , / ~ - . : = @ ; $ _ ! * '";
	}

	public mrnMaskForVessel():string {
		return this.mrnMCP + 'vessel:' + this.idpNamespace + ':' + this.orgShortName() + ':';
	}

	public mrnMaskForDevice():string {
		return this.mrnMCP + 'device:' + this.idpNamespace + ':' + this.orgShortName() + ':';
	}

	public mrnMaskForOrganization():string {
		return this.mrnMCP + 'org:' + this.idpNamespace + ':';
	}

	public mrnMaskForUserOfOrg(orgMrn:string):string {
		return this.mrnPreFixForOrg(orgMrn) + 'user:' + this.idpNamespace + ':' + this.orgShortNameFromMrn(orgMrn) + ':';
	}

	public mrnMaskForUser():string {
		return this.mrnMCP + 'user:' + this.idpNamespace + ':' + this.orgShortName() + ':';
	}

	public mrnMaskForSpecification():string {
		// TODO Temp check until mrn-service is ready
		return this.mrnMCP + 'service:' + this.idpNamespace + ':' + this.orgShortName() + ':specification:';
		//return "urn:mrn:[mcp|stm]:service:specification:" + this.orgShortName() + ':';
	}

	public mrnMaskForDesign():string {
		// TODO Temp check until mrn-service is ready
		return this.mrnMCP + 'service:' + this.idpNamespace + ':' + this.orgShortName() + ':design:';
		//return "urn:mrn:[mcp|stm]:service:design:" + this.orgShortName() + ':';
	}

	public mrnMaskForInstance():string {
		return this.mrnMCP + 'service:' + this.idpNamespace + ':' + this.orgShortName() + ':instance:';
		//return this.mrnPreFix() + 'service:instance:' + this.orgShortName() + ':';
	}

	public mrnMaskTextForInstance():string {
		// TODO Temp check until mrn-service is ready
		return this.mrnMCP + 'service:' + this.idpNamespace + ':' + this.orgShortName() + ':instance:';
		//return "urn:mrn:[mcp|stm]:service:instance:" + this.orgShortName() + ':';
	}

	public checkMrnForSpecification(specificationMrn:string) : boolean {
		// TODO Temp check until mrn-service is ready
		let rawRegex = `^${this.mrnMaskForSpecification()}((([-._a-z0-9]|~)|%[0-9a-f][0-9a-f]|([!$&'()*+,;=])|:|@)((([-._a-z0-9]|~)|%[0-9a-f][0-9a-f]|([!$&'()*+,;=])|:|@)|\/)*)$`;
		console.log(rawRegex);
		let regex = new RegExp(rawRegex);
		return regex.test(specificationMrn);
		//return specificationMrn.indexOf(':service:specification:' + this.orgShortName() + ':') >= 0 && specificationMrn.startsWith('urn:mrn:');
		//return this.checkMrn(specificationMrn, this.mrnMaskForSpecification());
	}

	public checkMrnForDesign(designMrn:string) : boolean {
		// TODO Temp check until mrn-service is ready
		let rawRegex = `^${this.mrnMaskForDesign()}((([-._a-z0-9]|~)|%[0-9a-f][0-9a-f]|([!$&'()*+,;=])|:|@)((([-._a-z0-9]|~)|%[0-9a-f][0-9a-f]|([!$&'()*+,;=])|:|@)|\/)*)$`;
		let regex = new RegExp(rawRegex);
		return regex.test(designMrn);
		//return designMrn.indexOf(':service:design:' + this.orgShortName() + ':') >= 0 && designMrn.startsWith('urn:mrn:');
	//	return this.checkMrn(designMrn, this.mrnMaskForDesign());
	}

	public checkMrnForInstance(instanceMrn:string) : boolean {
		// TODO Temp check until mrn-service is ready
		let rawRegex = `^${this.mrnMaskForInstance()}((([-._a-z0-9]|~)|%[0-9a-f][0-9a-f]|([!$&'()*+,;=])|:|@)((([-._a-z0-9]|~)|%[0-9a-f][0-9a-f]|([!$&'()*+,;=])|:|@)|\/)*)$`;
		let regex = new RegExp(rawRegex, 'g');
		return regex.test(instanceMrn);
		//return instanceMrn.indexOf(':service:instance:' + this.orgShortName() + ':') >= 0 && instanceMrn.startsWith('urn:mrn:');
		//return this.checkMrn(instanceMrn, this.mrnMaskForInstance());
	}

	public checkMrn(mrn:string, validMrnMask:string) : boolean {
		try {
			let elementIdIndex = mrn.indexOf(validMrnMask);
			if (elementIdIndex < 0) {
				return false;
			}
			var valid = true;
			let idSplit = mrn.substring(elementIdIndex).split(':');
			idSplit.forEach(idElement => {
				if(!idElement.toLowerCase().match(this.mrnPattern())) {
					valid = false;
				}
			});

			return valid;
		} catch (error) {
			return false;
		}
	}
}

