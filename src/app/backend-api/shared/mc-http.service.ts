import { Injectable } from '@angular/core';
import {Http, ConnectionBackend, RequestOptions, Response, RequestOptionsArgs, Request} from '@angular/http';
import {Observable} from "rxjs";
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
    return this.prepareService(options).flatMap(optionsMap => { return this.intercept(super.request(url, optionsMap))});
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
  private intercept(observable: Observable<Response>): Observable<Response> {
    return observable.catch((err, source) => {
      if (err.status  == 401 ) {
        AuthService.handle401();
        return Observable.empty();
      } else {
        return Observable.throw(err);
      }
    });
  }

}
