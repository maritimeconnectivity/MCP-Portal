import { Injectable } from "@angular/core";
import {NotificationsService} from "angular2-notifications";

@Injectable()
export class ErrorLoggingService {

  constructor(private notificationService: NotificationsService ) {

  }

  public logError( error: any, showToUser:boolean ) : void {
    this.sendToConsole(error);
    if (showToUser) {
      this.sendToUser(error);
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
