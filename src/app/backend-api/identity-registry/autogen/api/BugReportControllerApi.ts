import { Inject, Injectable, Optional }                      from '@angular/core';
import { Http, Headers, URLSearchParams }                    from '@angular/http';
import { RequestMethod, RequestOptions, RequestOptionsArgs } from '@angular/http';
import { Response, ResponseContentType }                     from '@angular/http';

import { Observable }                                        from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { BASE_PATH }                                         from '../variables';
import {BugReport} from "../model/BugReport";



@Injectable()
export class BugReportControllerApi {
    protected basePath = 'https://test-api.maritimecloud.net/';
    public defaultHeaders: Headers = new Headers();

    constructor(protected http: Http, @Optional()@Inject(BASE_PATH) basePath: string) {
        if (basePath) {
            //TODO: when deployed to prod, change this.
	        // this.basePath = basePath;
        }
    }

    /**
     * 
     * Extends object by coping non-existing properties.
     * @param objA object to be extended
     * @param objB source object
     */
    private extendObj<T1,T2>(objA: T1, objB: T2) {
        for(let key in objB){
            if(objB.hasOwnProperty(key)){
                (objA as any)[key] = (objB as any)[key];
            }
        }
        return <T1&T2>objA;
    }

    public reportBugPostUsingPOST(bugReport: BugReport, extraHttpRequestParams?: any): Observable<any> {
        return this.reportBugPostUsingPOSTWithHttpInfo(bugReport, extraHttpRequestParams)
            .map((response: Response) => {
                if (response.status === 204) {
                    return undefined;
                } else {
                    return response.json();
                }
            });
    }

    private reportBugPostUsingPOSTWithHttpInfo(bugReport: BugReport, extraHttpRequestParams?: any): Observable<Response> {
        const path = this.basePath + `/oidc/api/report-bug`;

        let queryParameters = new URLSearchParams();
        let headers = new Headers(this.defaultHeaders.toJSON()); // https://github.com/angular/angular/issues/6845
        let formParams = new URLSearchParams();

        if (bugReport === null || bugReport === undefined) {
            throw new Error('Required parameter bugReport was null or undefined when calling reportBugPostUsingPOST.');
        }


	    // to determine the Content-Type header
	    let consumes: string[] = [
		    'application/json'
	    ];

	    // to determine the Accept header
	    let produces: string[] = [
		    'application/json;charset=UTF-8'
	    ];



	    headers.set('Content-Type', 'application/json');

	    let requestOptions: RequestOptionsArgs = new RequestOptions({
		    method: RequestMethod.Post,
		    headers: headers,
		    body: bugReport == null ? '' : JSON.stringify(bugReport), // https://github.com/angular/angular/issues/10612
		    search: queryParameters
	    });

	    // https://github.com/swagger-api/swagger-codegen/issues/4037
	    if (extraHttpRequestParams) {
		    requestOptions = this.extendObj(requestOptions, extraHttpRequestParams);
	    }

	    return this.http.request(path, requestOptions);
    }
}
