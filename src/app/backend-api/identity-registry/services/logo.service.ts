import {Injectable, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {LogocontrollerApi} from "../autogen/api/LogocontrollerApi";

const NO_LOGO = "#NO_LOGO#";

@Injectable()
export class LogoService implements OnInit {
	private logoCache: { [mrn: string]: any; } = { };
  constructor(private logoApi: LogocontrollerApi) {
  }

  ngOnInit() {
  }

  public uploadLogo(orgMrn:string, logo:any): Observable<any> {
	  return Observable.create(observer => {
		  this.logoApi.createLogoPostUsingPOST(orgMrn, logo).subscribe(
			  logo => {
				  this.putImageInCache(orgMrn, null);
				  observer.next(logo);
			  },
			  err => {
				  observer.error(err);
			  }
		  );
	  });
  }

  public getLogoForOrganization(orgMrn:string): Observable<any> {
	  let imageFromCache = this.imageFromCache(orgMrn)
	  if (imageFromCache) {
		  if (imageFromCache === NO_LOGO) {
			  return this.noLogoObservable();
		  }
		  return Observable.of(imageFromCache);
	  }

	  return Observable.create(observer => {
		  this.logoApi.getLogoUsingGET(orgMrn).subscribe(
			  logo => {
				  this.putImageInCache(orgMrn, logo);
				  observer.next(logo);
			  },
			  err => {
				  this.putImageInCache(orgMrn, NO_LOGO);
				  observer.error(err);
			  }
		  );
	  });
  }

	private putImageInCache(mrn:string,image:any){
		this.logoCache[mrn] = image;
	}

  private imageFromCache(mrn:string):any {
	  return this.logoCache[mrn];
  }

  private noLogoObservable(): Observable<any>  {
	  return Observable.create(observer => {
		  observer.error('');
	  });
  }
}
