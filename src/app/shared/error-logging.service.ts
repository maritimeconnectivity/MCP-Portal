import { Injectable } from "@angular/core";
import {MCNotificationsService, MCNotificationType} from "./mc-notifications.service";

@Injectable()
export class ErrorLoggingService {

  constructor(private notificationService: MCNotificationsService ) {

  }

  public logError( error: any ) : void {
    this.sendToConsole(error);
    this.sendToUser(error);
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

  private sendToUser(error: any): void {
    var orgError = error.originalError;
    if (!orgError) {
      orgError = error;
    }
    var message = orgError.message;
    if (!message) {
      message = '';
    }
    this.notificationService.generateNotification({title:'Error', message:'Unexpected error occurred:\n'+message, type:MCNotificationType.Error});
  }
}
