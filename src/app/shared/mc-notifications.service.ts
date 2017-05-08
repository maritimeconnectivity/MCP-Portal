import {Injectable} from "@angular/core";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {ErrorLoggingService} from "./error-logging.service";
import {UserError} from "./UserError";

export enum MCNotificationType {Success, Error, Info, Alert}
export interface NotificationModel {
  title: string;
  message: string;
  type: MCNotificationType;
  originalError?:any;
}

@Injectable()
export class MCNotificationsService {

	public errorLog:string;

  constructor(private errorLogger: ErrorLoggingService) {}

  private notificationObserver = new ReplaySubject<NotificationModel>();

  public notifications = this.notificationObserver.asObservable();

  public generateNotification(title:string, message:string, type: MCNotificationType, originalError?:any) {
  	var displaySendBugReport = true;
    if (originalError) {
      this.errorLogger.logErrorWithMessage(message, originalError, false);
	    var extraMessage;
	    try {
		    let jsonError = originalError.json().error;
		    let jsonErrorMessage = originalError.json().message;
		    if (jsonError || jsonErrorMessage) {
		    	extraMessage = jsonError + ",\n" + jsonErrorMessage;
		    } else {
		    	extraMessage = JSON.stringify(originalError.json());
		    }
		    displaySendBugReport = this.shouldDisplayBugReportMessage(originalError);
	    } catch (err) {
		    extraMessage = originalError;
		    if (originalError instanceof UserError) {
			    displaySendBugReport = false;
			    extraMessage = JSON.stringify(originalError.errorMessage);
		    }
	    }
	    finally {
		    if (extraMessage.length > 400) {
			    this.errorLog = extraMessage;
			    extraMessage = ": See error log for details";
		    } else {
		    	extraMessage = ". Error was: " + extraMessage;
		    }
		    // If this is an internal error created by this Portal then the message will be contained in the extraMessage and we don't wanna show it twice
		    if (extraMessage.indexOf(message) < 0) {
			    message += extraMessage;
		    }
	    }
    }
	  this.notificationObserver.next({title:title, message:message, type:type});

	  let isXmlError = message.indexOf("Error trying to parse required field") > -1;
	  displaySendBugReport = displaySendBugReport && !isXmlError;
	  if(originalError && this.errorLogger.options.makeBugReportFromError && displaySendBugReport) {
		  this.notificationObserver.next({title:title, message:"A Bug Report was send automatically.", type:type});
	  }
  }

  private shouldDisplayBugReportMessage(error:any) : boolean {
	  try {
		  return !(error.status == 400 && error.statusText === 'Bad Request')
	  } catch (err) {
	  	return true;
	  }
  }
}
