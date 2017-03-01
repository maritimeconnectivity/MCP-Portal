import {Injectable} from "@angular/core";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {ErrorLoggingService} from "./error-logging.service";

export enum MCNotificationType {Success, Error, Info, Alert}
export interface NotificationModel {
  title: string;
  message: string;
  type: MCNotificationType;
  originalError?:any;
}

@Injectable()
export class MCNotificationsService {

  constructor(private errorLogger: ErrorLoggingService) {}

  private notificationObserver = new ReplaySubject<NotificationModel>();

  public notifications = this.notificationObserver.asObservable();

  public generateNotification(title:string, message:string, type: MCNotificationType, originalError?:any) {
    if (originalError) {
      this.errorLogger.logErrorWithMessage(message, originalError, false);
	    try {
		    let extraMessage = "\n\nError was: " + originalError.json().error + ",\n" + originalError.json().message;
		    message += extraMessage;
	    } catch (err) {
		    let extraMessage = "\n\nError was: " + originalError;
		    // If this is an internal error created by this Portal then the message will be contained in the extraMessage and we don't wanna show it twice
		    if (extraMessage.indexOf(message) < 0) {
		      message += extraMessage;
		    }
	    }
    }
	  this.notificationObserver.next({title:title, message:message, type:type});

	  if(originalError && this.errorLogger.options.makeBugReportFromError) {
		  this.notificationObserver.next({title:title, message:"A Bug Report was send automatically.", type:type});
	  }
  }
}
