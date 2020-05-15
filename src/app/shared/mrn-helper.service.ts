import {Injectable} from "@angular/core";
import {AuthService} from "../authentication/services/auth.service";

const mrnSTM = "urn:mrn:stm:";
const mrnMCL = "urn:mrn:mcl:";
// TODO this is only a temp solution until there is a backend service to do it
@Injectable()
export class MrnHelperService {

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

	public isStmOrg():boolean {
		return this.authService.authState.orgMrn.indexOf(mrnSTM) > -1;
	}

	public orgShortName():string {
		return this.orgShortNameFromMrn(this.authService.authState.orgMrn);
	}

	public mrnPattern():string {
		return "^urn:mrn:mcp:(device|org|user|vessel|service|mms):([a-z0-9]([a-z0-9]|-){0,20}[a-z0-9]):((([-._a-z0-9]|~)|%[0-9a-f][0-9a-f]|([!$&'()*+,;=])|:|@)((([-._a-z0-9]|~)|%[0-9a-f][0-9a-f]|([!$&'()*+,;=])|:|@)|/)*)$";
	}
	public mrnPatternError():string {
		return "It should contain at least 3 characters and only a-z 0-9 + , \\ - . : = @ ; $ _ ! * '";
	}

	public mrnMaskForVessel():string {
		return this.mrnPreFix() + 'vessel:' + this.orgShortName() + ':';
	}

	public mrnMaskForDevice():string {
		return this.mrnPreFix() + 'device:' + this.orgShortName() + ':';
	}

	public mrnMaskForOrganization(isStm:boolean):string {
		return (isStm ? mrnSTM : mrnMCL) + 'org:';
	}

	public mrnMaskForUserOfOrg(orgMrn:string):string {
		return this.mrnPreFixForOrg(orgMrn) + 'user:' + this.orgShortNameFromMrn(orgMrn) + ':';
	}

	public mrnMaskForUser():string {
		return this.mrnPreFix() + 'user:' + this.orgShortName() + ':';
	}

	public mrnMaskForSpecification():string {
		// TODO Temp check until mrn-service is ready
		return "urn:mrn:[mcp|stm]:service:specification:" + this.orgShortName() + ':';
	}

	public mrnMaskForDesign():string {
		// TODO Temp check until mrn-service is ready
		return "urn:mrn:[mcp|stm]:service:design:" + this.orgShortName() + ':';
	}

	public mrnMaskForInstance():string {
		return this.mrnPreFix() + 'service:instance:' + this.orgShortName() + ':';
	}

	public mrnMaskTextForInstance():string {
		// TODO Temp check until mrn-service is ready
		return "urn:mrn:[mcp|stm]:service:instance:" + this.orgShortName() + ':';
	}

	public checkMrnForSpecification(specificationMrn:string) : boolean {
		// TODO Temp check until mrn-service is ready
		return specificationMrn.indexOf(':service:specification:' + this.orgShortName() + ':') >= 0 && specificationMrn.startsWith('urn:mrn:');
		//return this.checkMrn(specificationMrn, this.mrnMaskForSpecification());
	}

	public checkMrnForDesign(designMrn:string) : boolean {
		// TODO Temp check until mrn-service is ready
		return designMrn.indexOf(':service:design:' + this.orgShortName() + ':') >= 0 && designMrn.startsWith('urn:mrn:');
	//	return this.checkMrn(designMrn, this.mrnMaskForDesign());
	}

	public checkMrnForInstance(instanceMrn:string) : boolean {
		// TODO Temp check until mrn-service is ready
		return instanceMrn.indexOf(':service:instance:' + this.orgShortName() + ':') >= 0 && instanceMrn.startsWith('urn:mrn:');
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

