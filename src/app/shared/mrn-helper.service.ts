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
		var orgSplit = orgMrn.split(':');
		return orgSplit[orgSplit.length-1];
	}

	private mrnPreFix():string {
		return this.mrnPreFixForOrg(this.authService.authState.orgMrn);
	}

	private mrnPreFixForOrg(orgMrn:string):string {
		var orgSplit = orgMrn.split(':org:');
		return orgSplit[0] + ":";
	}

	private orgShortName():string {
		return this.orgShortNameFromMrn(this.authService.authState.orgMrn);
	}

	public mrnPattern():string {
		return '[a-zA-Z0-9_-]{3,25}';
	}
	public mrnPatternError():string {
		return 'It should contain at least 3 characters and only a-z 0-9 - _';
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
		return this.mrnPreFix() + 'service:specification' + this.orgShortName() + ':';
	}

	public mrnMaskForDesign():string {
		return this.mrnPreFix() + 'service:design:' + this.orgShortName() + ':';
	}

	public mrnMaskForInstance():string {
		return this.mrnPreFix() + 'service:instance:' + this.orgShortName() + ':';
	}
}

