import {
	Injectable, OnInit, ComponentFactoryResolver, ViewContainerRef, ComponentRef, ReflectiveInjector
} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {BugReport} from "../autogen/model/BugReport";
import {McHttpService} from "../../shared/mc-http.service";
import {AuthService, AuthUser} from "../../../authentication/services/auth.service";
import {BugReportControllerApi} from "../autogen/api/BugReportControllerApi";

@Injectable()
export class BugReportingService {

	private version = require("../../../../../package.json").version;
  constructor(private bugReportApi: BugReportControllerApi) {
  }

  public reportBug(bugReport:BugReport) {
		bugReport.subject = BANNER_TEXT + ' - ' + this.version + ': ' + bugReport.subject;
  	if (AuthService.staticAuthInfo && AuthService.staticAuthInfo.loggedIn) {
  		this.addUserToReport(bugReport, AuthService.staticAuthInfo.user);
	  }
	  McHttpService.nextCallShouldNotAuthenticate();
	  this.bugReportApi.reportBugPostUsingPOST(bugReport).subscribe(
	  	_ => {
	  		// Nothing should happen
		  },
		  err => {
			  // Error reporting error. Just log and ignore
			  console.log("Error when sending bug report: ", err);
		  }
	  );
  }

  private addUserToReport(bugReport:BugReport,authUser: AuthUser) {
	  let fullName = authUser.firstName + ' ' + authUser.lastName;
	  let email = authUser.email;
	  let mrn = authUser.mrn;
	  let userName = authUser.preferredUsername;
	  let organization = authUser.organization;

	  let userString =
		  "USER INFO: \n" +
		  "mrn: " + mrn + "\n" +
		  "Name: " + fullName + "\n" +
		  "Email: " + email + "\n" +
		  "Preferred username: " + userName + "\n" +
		  "Organization mrn: " + organization + "\n\n";

	  bugReport.description = userString + bugReport.description;
  }
}
