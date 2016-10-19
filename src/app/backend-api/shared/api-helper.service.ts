import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {AuthService} from "../../authentication/services/auth.service";

@Injectable()
export class ApiHelperService {
  constructor() {}


  public prepareService(serviceApi: any, shouldAuthenticate: boolean): Observable<string> {
    if (!serviceApi.defaultHeaders) {
      throw new Error('Parameter serviceApi not a proper service api');
    }
    return Observable.create(observer => {
      serviceApi.defaultHeaders.set('Content-Type', 'application/json; charset=utf-8' );
      if (shouldAuthenticate) {
        AuthService.getToken()
          .then(token => {
            serviceApi.defaultHeaders.set('Authorization', 'Bearer ' + token);
            observer.next(token);
            observer.complete();
          })
          .catch(error => {
            serviceApi.defaultHeaders.delete('Authorization');
            // TODO: Shouldn't I just call logout? and then call the notification-center with a message?
            throw new Error(error);
          });
      } else {
        serviceApi.defaultHeaders.delete('Authorization');
        observer.next('');
        observer.complete();
      }
    });
  }
}
