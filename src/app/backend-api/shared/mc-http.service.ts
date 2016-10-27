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
    return super.request(url, this.prepareService(options));
  }
  public prepareService(options?: RequestOptionsArgs): RequestOptionsArgs {
    AuthService.refreshToken();
    options.headers.set('Content-Type', 'application/json; charset=utf-8' );
    if (McHttpService.shouldAuthenticate) {
      options.headers.set('Authorization', 'Bearer ' + AuthService.getToken());
    } else {
      McHttpService.shouldAuthenticate = true;
      options.headers.delete('Authorization');
    }
    return options;
  }

}
