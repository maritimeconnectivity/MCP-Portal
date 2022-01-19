import {Injectable, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {VesselimagecontrollerApi} from "../autogen/api/VesselimagecontrollerApi";
import {AuthService} from "../../../authentication/services/auth.service";

const NO_IMAGE = "#NO_IMAGE#";

@Injectable()
export class VesselImageService implements OnInit {
	private imageCache: { [mrn: string]: any; } = { };
  constructor(private authService: AuthService, private vesselImageApi: VesselimagecontrollerApi) {
  }

  ngOnInit() {
  }

  public uploadImage(vesselMrn:string, image:any, mediaType: string): Observable<any> {
	  return Observable.create(observer => {
		  let orgMrn = this.authService.authState.orgMrn;
		  this.vesselImageApi.createVesselImagePutUsingPUT(orgMrn, vesselMrn, image, mediaType).subscribe(
			  image => {
				  this.putImageInCache(vesselMrn, null);
				  observer.next(image);
			  },
			  err => {
				  observer.error(err);
			  }
		  );
	  });
  }

  public getImageForVessel(vesselMrn:string): Observable<any> {
	  let imageFromCache = this.imageFromCache(vesselMrn)
	  if (imageFromCache) {
		  if (imageFromCache === NO_IMAGE) {
			  return this.noImageObservable();
		  }
		  return Observable.of(imageFromCache);
	  }

	  return Observable.create(observer => {
		  let orgMrn = this.authService.authState.orgMrn;
		  this.vesselImageApi.getVesselImageUsingGET(orgMrn,vesselMrn).subscribe(
			  image => {
				  this.putImageInCache(vesselMrn, image);
				  observer.next(image);
			  },
			  err => {
				  this.putImageInCache(vesselMrn, NO_IMAGE);
				  observer.error(err);
			  }
		  );
	  });
  }

	private putImageInCache(mrn:string,image:any){
		this.imageCache[mrn] = image;
	}

  private imageFromCache(mrn:string):any {
	  return this.imageCache[mrn];
  }

  private noImageObservable(): Observable<any>  {
	  return Observable.create(observer => {
		  observer.error('');
	  });
  }
}
