import {Injectable, Inject} from "@angular/core";
import {NotificationsService} from "angular2-notifications";
import {BugReportingService} from "../backend-api/identity-registry/services/bug-reporting.service";
import {BugReport} from "../backend-api/identity-registry/autogen/model/BugReport";

export interface MCErrorLoggerOptions {
	makeBugReportFromError: boolean;
}

export var MC_ERROR_LOGGER_OPTIONS: MCErrorLoggerOptions = {
	makeBugReportFromError: false
};

@Injectable()
export class ErrorLoggingService {

	private options: MCErrorLoggerOptions;
  constructor(private notificationService: NotificationsService, private bugreportService: BugReportingService, @Inject( MC_ERROR_LOGGER_OPTIONS ) options: MCErrorLoggerOptions) {
	  this.options = options;
  }

  public logError( error: any, showToUser:boolean ) : void {
    this.logErrorWithMessage(null, error, showToUser);
  }
	public logErrorWithMessage(message:string, error: any, showToUser:boolean ) : void {
		this.sendToConsole(error);
		if (showToUser) {
			this.sendToUser(error);
		}
		if (this.options.makeBugReportFromError && !IS_DEV) {
			this.sendToServer(message, error);
		}
	}

	private sendToConsole(error: any): void {
		if ( console && console.group && console.error ) {
			console.group("Maritime Cloud - Error logging");
			console.error(error);
			console.error( "Error message: ", error.message );
			console.error( "Error stack: ", error.stack );
			console.groupEnd();
		}
	}

	private sendToServer(message:string,error: any): void {
  	let subject = "AUTO-generated error";
  	var errorString = '';

		if ( message ) {
			errorString += "MESSAGE: \n" + message + "\n\n";
		}

		try {
			if ( error.json() ) {
				errorString += "ERROR JSON: \n" + JSON.stringify(error.json()) + "\n\n";
			}
		}catch (err) {} // Error occured when trying to call error.json(). This is OK, because it's then probably a system error and no action is needed

		if ( error.message ) {
			errorString += "ORIGINAL ERROR MESSAGE: \n" + error.message + "\n\n";
		}
		if ( error.stack ) {
			errorString += "ORIGINAL ERROR STACKTRACE: \n" + error.stack;
		}
		if (errorString.length > 0) {
			let bugReport:BugReport = {subject:subject, description:errorString};
			this.bugreportService.reportBug(bugReport);
		}
	}

  private sendToUser(error: any): void {
    var orgError = error.originalError;
    if (!orgError) {
      orgError = error;
    }
    var message = orgError.message;
    if (!message) {
      message = '';
    }
    this.notificationService.error('Error', 'Unexpected error occurred:\n'+message);
  }
}
export var MC_ERROR_LOGGER_PROVIDERS = [
	{
		provide: MC_ERROR_LOGGER_OPTIONS,
		useValue: MC_ERROR_LOGGER_OPTIONS
	},
	ErrorLoggingService
];
