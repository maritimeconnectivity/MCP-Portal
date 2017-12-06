import {
	Injectable
} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {BugReport} from "../autogen/model/BugReport";
import {AuthService, AuthUser} from "../../../authentication/services/auth.service";
import {BugReportControllerApi} from "../autogen/api/BugReportControllerApi";
import {ErrorLoggingService} from "../../shared/error-logging.service";
import {SWAGGER_LOCATION} from "../../shared/app.constants";
import {
	Headers, Http, RequestMethod, RequestOptions, RequestOptionsArgs, Response,
	URLSearchParams
} from "@angular/http";
import {McHttpService} from "./mc-http.service";
import {ServerUnreachableError} from "../../shared/ServerUnreachableError";

@Injectable()
export class ApiVersionService {

  constructor(private errorLoggingService:ErrorLoggingService, private http:Http) {
  }

	public getVersionOfIdentityRegistry():Observable<string> {
		let jsonLocation =  IR_BASE_PATH + SWAGGER_LOCATION;
		return this.getVersionFromSwagger(jsonLocation);
	}

	public getVersionOfServiceRegistry():Observable<string> {
		let jsonLocation =  SR_BASE_PATH + SWAGGER_LOCATION;
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
						this.logParseError(err, swaggerLocation);
						observer.next('?');
					}
				},
				err => {
					if (err instanceof ServerUnreachableError) {
						this.logConnectionError(err);
						observer.next('Unreachable');
					} else {
						this.logParseError(err, swaggerLocation);
						observer.next('?');
					}
				}
			);
		})
	}

	private logConnectionError(err:any) {
		this.errorLoggingService.logError(err, true);
	}

	private logParseError(err:any, swaggerLocation:string) {
		this.errorLoggingService.logErrorWithMessage("Error trying to parse Swagger JSON from: " + swaggerLocation, err, false);
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
