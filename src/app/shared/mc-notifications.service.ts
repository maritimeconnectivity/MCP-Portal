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

  public generateNotification(title:string, message:string, type: MCNotificationType, anyError?:any) {
	  let isUserError = anyError instanceof UserError;

    if (anyError) {
      this.errorLogger.logErrorWithMessage(message, anyError, false);
	    var extraMessage;
	    var originalError = anyError;
	    if (isUserError && anyError.originalError) {
		    originalError = anyError.originalError;
	    }
	    try {
		    let jsonError = originalError.json().error;
		    let jsonErrorMessage = originalError.json().message;
		    if (jsonError || jsonErrorMessage) {
		    	extraMessage = jsonError + ",\n" + jsonErrorMessage;
		    } else {
		    	extraMessage = JSON.stringify(originalError.json());
		    }
	    } catch (err) {
		    extraMessage = originalError;
		    if (isUserError) {
			    extraMessage = JSON.stringify(anyError.errorMessage);
		    }
	    }
	    finally {
		    if (extraMessage.length > 400) {
			    this.errorLog = extraMessage;
			    extraMessage = ": See error log for details";
		    } else {
			    this.errorLog = null;
		    	extraMessage = ". Error was: " + extraMessage;
		    }
		    // If this is an internal error created by this Portal then the message will be contained in the extraMessage and we don't wanna show it twice
		    if (extraMessage.indexOf(message) < 0) {
			    message += extraMessage;
		    }
	    }
    }
	  this.notificationObserver.next({title:title, message:message, type:type});

	  if(anyError && this.errorLogger.options.makeBugReportFromError && !isUserError) {
		  this.notificationObserver.next({title:title, message:"A Bug Report was send automatically.", type:type});
	  }
  }
}
