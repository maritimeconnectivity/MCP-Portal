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

  public generateNotification(model: NotificationModel) {
    this.notificationObserver.next(model);
    if (model.originalError) {
      this.errorLogger.logError(model.originalError, false);
    }
  }
}
