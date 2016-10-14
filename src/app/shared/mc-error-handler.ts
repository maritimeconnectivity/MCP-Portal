import { ErrorHandler } from "@angular/core";
import { Inject } from "@angular/core";
import { Injectable } from "@angular/core";
import {ErrorLoggingService} from "./error-logging.service";


export interface MCErrorHandlerOptions {
  rethrowError: boolean;
  unwrapError: boolean;
}

export var MC_ERROR_HANDLER_OPTIONS: MCErrorHandlerOptions = {
  rethrowError: false,
  unwrapError: false
};


@Injectable()
export class MCErrorHandler implements ErrorHandler {

  private options: MCErrorHandlerOptions;

  constructor(
    private errorLoggingService: ErrorLoggingService,
    @Inject( MC_ERROR_HANDLER_OPTIONS ) options: MCErrorHandlerOptions
  ) {
    this.options = options;
  }

  public handleError( error: any ) : void {

    // Send to the error-logging service.
    try {
      this.options.unwrapError
        ? this.errorLoggingService.logError( this.findOriginalError( error ) )
        : this.errorLoggingService.logError( error )
      ;
    } catch ( loggingError ) {
      console.group( "ErrorHandler" );
      console.warn( "Error when trying to log error to ", this.errorLoggingService );
      console.error( loggingError );
      console.groupEnd();
    }

    if ( this.options.rethrowError ) {
      throw( error );
    }
  }

  private findOriginalError( error: any ) : any {

    while ( error && error.originalError ) {
      error = error.originalError;
    }
    return( error );
  }

}

export var MC_ERROR_HANDLER_PROVIDERS = [
  {
    provide: MC_ERROR_HANDLER_OPTIONS,
    useValue: MC_ERROR_HANDLER_OPTIONS
  },
  {
    provide: ErrorHandler,
    useClass: MCErrorHandler
  }
];
