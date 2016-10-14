import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {Injectable} from "@angular/core";
import {ReplaySubject} from "rxjs";

export enum MCNotificationType {Success, Error, Info, Alert}
export interface NotificationModel {
  title: string;
  message: string;
  type: MCNotificationType;
}

@Injectable()
export class MCNotificationsService {
  private notificationObserver = new ReplaySubject<NotificationModel>();

  public notifications = this.notificationObserver.asObservable();

  public generateNotification(model: NotificationModel) {
    this.notificationObserver.next(model);
  }
}
