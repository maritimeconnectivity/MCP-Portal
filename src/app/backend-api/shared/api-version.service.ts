import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { BugReport } from "../autogen/model/BugReport";
import { AuthService, AuthUser } from "../../../authentication/services/auth.service";
import { BugReportControllerApi } from "../autogen/api/BugReportControllerApi";
import { SWAGGER_LOCATION } from "../../shared/app.constants";
import {
    Headers,
    Http,
    RequestMethod,
    RequestOptions,
    RequestOptionsArgs,
    Response,
    URLSearchParams
} from "@angular/http";
import { McHttpService } from "./mc-http.service";
import { ServerUnreachableError } from "../../shared/ServerUnreachableError";

@Injectable()
export class ApiVersionService {

  constructor(private http:Http) {
  }

	public getVersionOfIdentityRegistry():Observable<string> {
		let jsonLocation =  IR_BASE_PATH + SWAGGER_LOCATION;
		return this.getVersionFromSwagger(jsonLocation);
	}

	public getVersionOfServiceRegistry():Observable<string> {
		let jsonLocation =  SR_BASE_PATH + SWAGGER_LOCATION;
		return this.getVersionFromSwagger(jsonLocation);
	}

	public getVersionOfEndorsementService(): Observable<string> {
  		let jsonLocation = ENDORSEMENT_BASE_PATH + SWAGGER_LOCATION;
  		return this.getVersionFromSwagger(jsonLocation);
	}

	private getVersionFromSwagger(swaggerLocation:string): Observable<string>{
		return Observable.create(observer => {
			McHttpService.nextCallShouldNotAuthenticate();
			this.getSwaggerJson(swaggerLocation).subscribe(
				swaggerJson => {
					try {
						let version:string = swaggerJson.info.version;
						observer.next(version);
					}catch (err) {
						observer.next('?');
					}
				},
				err => {
					if (err instanceof ServerUnreachableError) {
						observer.next('Unreachable');
					} else {
						observer.next('?');
					}
				}
			);
		})
	}
	
	private getSwaggerJson(swaggerLocation:string): Observable<any> {
		// to determine the Content-Type header
		let consumes: string[] = [
			'application/json'
		];

		// to determine the Accept header
		let produces: string[] = [
			'application/json;charset=UTF-8'
		];

		let requestOptions: RequestOptionsArgs = new RequestOptions({
			method: RequestMethod.Get,
			headers: new Headers(),
			search: new URLSearchParams(),
			withCredentials:false
		});

		return this.http.request(swaggerLocation, requestOptions)
			.map((response: Response) => {
				if (response.status === 204) {
					return '?';
				} else {
					return response.json() || {};
				}
			});
	}
}
