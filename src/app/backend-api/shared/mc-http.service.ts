import { Injectable } from '@angular/core';
import {Http, ConnectionBackend, RequestOptions, Response, RequestOptionsArgs, Request} from '@angular/http';
import {Observable} from "rxjs/Observable";
import {AuthService} from "../../authentication/services/auth.service";

@Injectable()
export class McHttpService extends Http {
  private static shouldAuthenticate = true;
  public static nextCallShouldNotAuthenticate() {
    McHttpService.shouldAuthenticate = false;
  }

  constructor(backend: ConnectionBackend, defaultOptions: RequestOptions) {
    super(backend, defaultOptions);
  }

  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    return this.prepareService(options).flatMap(optionsMap => { return this.interceptError(super.request(url, optionsMap))}).flatMap(response => { return this.interceptResponse(response)});
  }

  // Setting the http headers and if needed refreshes the access token
  private prepareService(options?: RequestOptionsArgs): Observable<RequestOptionsArgs> {
    return Observable.create(observer => {
      options.headers.set('Content-Type', 'application/json; charset=utf-8' );
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
      if (err.status  == 401 ) {
        AuthService.handle401();
        return Observable.empty();
      } else {
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
