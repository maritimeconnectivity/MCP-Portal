import {Injectable} from "@angular/core";
import {AuthService} from "../authentication/services/auth.service";

// TODO this is only a temp solution until there is a backend service to do it
@Injectable()
export class MrnHelperService {
	private mrnPreFix:string = 'urn:mrn:mcl:';
	constructor(private authService: AuthService) {
	}

	private orgShortNameFromMrn(orgMrn:string){
		var orgSplit = orgMrn.split(':');
		return orgSplit[orgSplit.length-1];
	}

	private orgShortName():string {
		return this.orgShortNameFromMrn(this.authService.authState.orgMrn);
	}

	public mrnPattern():string {
		return '[a-zA-Z0-9]{3,25}';
	}
	public mrnPatternError():string {
		return 'It should contain at least 3 characters and only a-z and 0-9';
	}

	public mrnMaskForVessel():string {
		return this.mrnPreFix + 'vessel:' + this.orgShortName() + ':';
	}

	public mrnMaskForDevice():string {
		return this.mrnPreFix + 'device:' + this.orgShortName() + ':';
	}

	public mrnMaskForOrganization():string {
		return this.mrnPreFix + 'org:';
	}

	public mrnMaskForUserOfOrg(orgMrn:string):string {
		return this.mrnPreFix + 'user:' + this.orgShortNameFromMrn(orgMrn) + ':';
	}

	public mrnMaskForUser():string {
		return this.mrnPreFix + 'user:' + this.orgShortName() + ':';
	}

	public mrnMaskForSpecification():string {
		return this.mrnPreFix + 'service:specification' + this.orgShortName() + ':';
	}

	public mrnMaskForDesign():string {
		return this.mrnPreFix + 'service:design:' + this.orgShortName() + ':';
	}

	public mrnMaskForInstance():string {
		return this.mrnPreFix + 'service:instance:' + this.orgShortName() + ':';
	}
}

