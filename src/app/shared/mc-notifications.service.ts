import {Injectable} from "@angular/core";
import {ReplaySubject} from "rxjs";
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
    this.notificationObserver.next({title:title, message:message, type:type});
    if (originalError) {
      this.errorLogger.logError(originalError, false);
    }
  }
}
