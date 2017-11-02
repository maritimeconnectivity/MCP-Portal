import { Injectable } from '@angular/core';
import {Http, ConnectionBackend, RequestOptions, Response, RequestOptionsArgs, Request} from '@angular/http';
import {Observable} from "rxjs/Observable";
import {AuthService} from "../../authentication/services/auth.service";
import {DONT_OVERWRITE_CONTENT_TYPE, MAX_HTTP_LOG_ENTRIES} from "../../shared/app.constants";
import {UserError} from "../../shared/UserError";

export interface HttpLogModel {
	url:string;
	options?:RequestOptionsArgs;
	date:Date;
}

@Injectable()
export class McHttpService extends Http {
	private static httpCallLog = new Array<HttpLogModel>();
  private static shouldAuthenticate = true;
  public static nextCallShouldNotAuthenticate() {
    McHttpService.shouldAuthenticate = false;
  }

  constructor(backend: ConnectionBackend, defaultOptions: RequestOptions) {
    super(backend, defaultOptions);
  }

  public static getHttpCallLog() : Array<HttpLogModel> {
  	return McHttpService.httpCallLog;
  }

  private static addCall(url: string | Request, requestDate:Date, options?: RequestOptionsArgs) {
  	try{
	    let requestUrl:string;
	    if (typeof url === "string") {
	      requestUrl = url;
		  } else {
	      requestUrl = url.url;
		  }
		  McHttpService.httpCallLog.push({url:requestUrl, options:options, date:requestDate});
			if (McHttpService.httpCallLog.length > MAX_HTTP_LOG_ENTRIES) {
				McHttpService.httpCallLog.splice(0,1);
			}
	  }catch(err){
		  // If anything goes wrong, then just continue
	  }
  }

  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
	  var requestUrl = url;
	  try {
	  	// We will try to url encode the params of the url
	    if (typeof url === "string"){
			  let indexDotSlashSlash = url.indexOf("://");
			  if (indexDotSlashSlash > -1) {
				  let urlProtocol = url.substring(0,indexDotSlashSlash+3);
				  let urlParams = url.substring(indexDotSlashSlash+3).split("/");
				  requestUrl = urlProtocol + urlParams[0];
				  for(let i=1; i<urlParams.length; i++) {
					  requestUrl += "/" + encodeURIComponent(urlParams[i]);
				  }
			  }
		  }
	  }catch(err){
	  	// So many things can go wrong, so we dont url encode
	  }
	  let requestDate = new Date();
	  McHttpService.addCall(requestUrl, requestDate, options);

    return this.prepareService(options).flatMap(optionsMap => {return this.interceptError(super.request(requestUrl, optionsMap))}).flatMap(response => {return this.interceptResponse(response)});
  }

  // Setting the http headers and if needed refreshes the access token
  private prepareService(options?: RequestOptionsArgs): Observable<RequestOptionsArgs> {
    return Observable.create(observer => {
	    if (options.headers.get(DONT_OVERWRITE_CONTENT_TYPE)){
		    options.headers.delete(DONT_OVERWRITE_CONTENT_TYPE);
	    } else {
		    options.headers.set('Content-Type', 'application/json; charset=utf-8' );
	    }
      if (McHttpService.shouldAuthenticate) {
        AuthService.getToken()
          .then(token => {
            options.headers.set('Authorization', 'Bearer ' + token);
            observer.next(options);
          })
          .catch(error => {
            AuthService.handle401();
          });
      } else {
        McHttpService.shouldAuthenticate = true;
        options.headers.delete('Authorization');
        observer.next(options);
      }
    });
  }

  // Intercepts errors from the http call
  private interceptError(observable: Observable<Response>): Observable<Response> {
    return observable.catch((err, source) => {
	    try {
		    if (err.status == 400) {
			    // Sorry for this hack. This is a SR-error that xml is not valid. We don't want to create a bug report  when this happens
			    var sendBugReport = true;
			    try {
				    let jsonErrorMessage = err.json().message;
				    sendBugReport = jsonErrorMessage.indexOf('cvc-') < 0;
			    } catch (e) {}
			    let userError = new UserError(err.statusText, err);
			    userError.sendBugReport = sendBugReport;
			    return Observable.throw(userError);
		    } else if (err.status  == 409 ) {
		    	let userError = new UserError(err.statusText, err);
		    	userError.sendBugReport = false;
			    return Observable.throw(userError);
		    } else if (err.status  == 401 ) {
	        AuthService.handle401();
	        return Observable.empty();
	      } else {
	        return Observable.throw(err);
	      }
	    } catch (errCatch) {
		    return Observable.throw(err);
	    }
    });
  }

	private interceptResponse(response: Response): Observable<Response> {
		return Observable.create(observer => {
			// If we have to response text the subsequent calls in the auto-generated code will fail, because they just do a response.toJson()
			if (!response.text() || response.text().length == 0) {
				if (response.status >= 200 && response.status < 300) {
					response.status = 204;
				}
			}
			observer.next(response);
		});
	}

}
